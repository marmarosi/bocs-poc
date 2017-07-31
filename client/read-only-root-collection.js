'use strict';

//region Imports

import config from './system/configuration.js';
import Argument from './system/argument-check.js';

import CollectionBase from './common/collection-base.js';
import ModelType from './common/model-type.js';
import ModelError from './common/model-error.js';
import ExtensionManager from './common/extension-manager.js';
import EventHandlerList from './common/event-handler-list.js';

import ClientTransferContext from './common/client-transfer-context.js';

import RuleManager from './rules/rule-manager.js';
import BrokenRuleList from './rules/broken-rule-list.js';
import AuthorizationAction from './rules/authorization-action.js';
import AuthorizationContext from './rules/authorization-context.js';

import DataPortalAction from './common/data-portal-action.js';
import DataPortalContext from './common/data-portal-context.js';
import DataPortalEvent from './common/data-portal-event.js';
import DataPortalEventArgs from './common/data-portal-event-args.js';
import DataPortalError from './common/data-portal-error.js';

//endregion

//region Private variables

const MODEL_DESC = 'Read-only root collection';
const M_FETCH = DataPortalAction.getName( DataPortalAction.fetch );

const _itemType = new WeakMap();
const _rules = new WeakMap();
const _extensions = new WeakMap();
const _eventHandlers = new WeakMap();
const _brokenRules = new WeakMap();
const _isValidated = new WeakMap();
const _dataContext = new WeakMap();
const _dao = new WeakMap();
const _items = new WeakMap();
const _totalItems = new WeakMap();

//endregion

//region Helper methods

//region Transfer object methods

function getTransferContext() {
  return new ClientTransferContext( null, null, null );
}

function baseToCto() {
  let cto = [];
  const items = _items.get( this );
  const totalItems = _totalItems.get( this );

  items.forEach( function ( item ) {
    cto.push( item.toCto() );
  } );
  if (totalItems)
    cto.totalItems = totalItems;
  return cto;
}

//endregion

//region Permissions

function getAuthorizationContext( action, targetName ) {
  const brokenRules = _brokenRules.get( this );
  return new AuthorizationContext( action, targetName || '', brokenRules );
}

function canDo( action ) {
  const rules = _rules.get( this );
  return rules.hasPermission(
    getAuthorizationContext.call( this, action )
  );
}

function canExecute( methodName ) {
  const rules = _rules.get( this );
  return rules.hasPermission(
    getAuthorizationContext.call( this, AuthorizationAction.executeMethod, methodName )
  );
}

//endregion

//region Child methods

function fetchChildren( data ) {
  const itemType = _itemType.get( this );
  const eventHandlers = _eventHandlers.get( this );

  return data instanceof Array ?
    Promise.all( data.map( dto => {
      return itemType.load( this, dto, eventHandlers );
    } ) ) :
    Promise.resolve( [] );
}

function getChildBrokenRules( namespace, bro ) {
  const items = _items.get( this );
  items.forEach( ( item, index ) => {
    const childBrokenRules = item.getBrokenRules( namespace );
    if (childBrokenRules) {
      bro.addItem( index, childBrokenRules );
    }
  } );
  return bro;
}

//endregion

//region Initialization

function initialize( name, itemType, rules, extensions, eventHandlers ) {

  eventHandlers = Argument.inConstructor( name )
    .check( eventHandlers ).forOptional( 'eventHandlers' ).asType( EventHandlerList );

  // Set up business rules.
  rules.initialize( config.noAccessBehavior );

  // Set up event handlers.
  if (eventHandlers)
    eventHandlers.setup( this );

  // Initialize instance state.
  _itemType.set( this, itemType );
  _rules.set( this, rules );
  _extensions.set( this, extensions );
  _eventHandlers.set( this, eventHandlers );
  _brokenRules.set( this, new BrokenRuleList( name ) );
  _isValidated.set( this, false );
  _dataContext.set( this, null );
  _items.set( this, [] );
  _totalItems.set( this, null );

  // Get data access object.
  _dao.set( this, extensions.getDataAccessObject( name ) );

  // Immutable definition object.
  Object.freeze( this );
}

//endregion

//endregion

//region Data portal methods

//region Helper

function getDataContext( connection ) {
  let dataContext = _dataContext.get( this );
  if (!dataContext) {
    dataContext = new DataPortalContext( _dao.get( this ) );
    _dataContext.set( this, dataContext );
  }
  return dataContext.setState( connection, false );
}

function raiseEvent( event, methodName, error ) {
  this.emit(
    DataPortalEvent.getName( event ),
    new DataPortalEventArgs( event, this.$modelName, null, methodName, error )
  );
}

function wrapError( error ) {
  return new DataPortalError( MODEL_DESC, this.$modelName, DataPortalAction.fetch, error );
}

//endregion

//region Fetch

function data_fetch( filter, method ) {
  const self = this;
  return new Promise( ( fulfill, reject ) => {
    // Check permissions.
    if (method === M_FETCH ?
        canDo.call( self, AuthorizationAction.fetchObject ) :
        canExecute.call( self, method )) {

      let connection = null;
      const extensions = _extensions.get( self );
      // Open connection.
      config.connectionManager.openConnection( extensions.dataSource )
        .then( dsc => {
          connection = dsc;
          // Launch start event.
          /**
           * The event arises before the collection instance will be retrieved from the repository.
           * @event ReadOnlyRootCollection#preFetch
           * @param {bo.common.DataPortalEventArgs} eventArgs - Data portal event arguments.
           * @param {ReadOnlyRootCollection} oldObject - The collection instance before the data portal action.
           */
          raiseEvent.call( self, DataPortalEvent.preFetch, method );
          // Execute fetch.
          const dao = _dao.get( self );
          // Root element fetches all data from repository.
          return extensions.dataFetch ?
            // *** Custom fetch.
            extensions.$runMethod( 'fetch', self, getDataContext.call( self, connection ), filter, method ) :
            // *** Standard fetch.
            dao.$runMethod( method, connection, filter );
        } )
        .then( data => {
          // Get the count of all available items.
          let totalItems = _totalItems.get( self );
          if (data.totalItems &&
            (typeof data.totalItems === 'number' || data.totalItems instanceof Number) &&
            data.totalItems % 1 === 0)
            totalItems = data.totalItems;
          else
            totalItems = null;
          _totalItems.set( self, totalItems );
          // Load children.
          return fetchChildren.call( self, data )
            .then( children => {
              let items = _items.get( self );
              children.forEach( child => {
                items.push( child );
              } );
              _items.set( self, items );
              return null;
            } );
        } )
        .then( none => {
          // Launch finish event.
          /**
           * The event arises after the collection instance has been retrieved from the repository.
           * @event ReadOnlyRootCollection#postFetch
           * @param {bo.common.DataPortalEventArgs} eventArgs - Data portal event arguments.
           * @param {ReadOnlyRootCollection} newObject - The collection instance after the data portal action.
           */
          raiseEvent.call( self, DataPortalEvent.postFetch, method );
          // Close connection.
          config.connectionManager.closeConnection( extensions.dataSource, connection )
            .then( none => {
              // Return the fetched read-only root collection.
              fulfill( self );
            } );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, reason );
          // Launch finish event.
          raiseEvent.call( self, DataPortalEvent.postFetch, method, dpe );
          // Close connection.
          config.connectionManager.closeConnection( extensions.dataSource, connection )
            .then( none => {
              // Pass the error.
              reject( dpe );
            } );
        } );
    }
  } );
}

//endregion

//endregion

/**
 * Represents the definition of a read-only root collection.
 *
 * @name ReadOnlyRootCollection
 * @extends CollectionBase
 *
 * @fires ReadOnlyRootCollection#preFetch
 * @fires ReadOnlyRootCollection#postFetch
 */
class ReadOnlyRootCollection extends CollectionBase {

  //region Constructor

  /**
   * Creates a new read-only root collection instance.
   *
   *    _The name of the model type available as:
   *    __&lt;instance&gt;.constructor.modelType__, returns 'ReadOnlyRootCollection'._
   *
   * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The event handlers must be an EventHandlerList object or null.
   */
  constructor( name, itemType, rules, extensions, eventHandlers ) {
    super();

    /**
     * The name of the model.
     *
     * @member {string} ReadOnlyRootCollection#$modelName
     * @readonly
     */
    this.$modelName = name;

    // Initialize the instance.
    initialize.call( this, name, itemType, rules, extensions, eventHandlers );
  }

  //endregion

  //region Properties

  /**
   * The count of the child objects in the collection.
   *
   * @member {number} ReadOnlyRootCollection#count
   * @readonly
   */
  get count() {
    const items = _items.get( this );
    return items.length;
  }

  /**
   * The count of all available items if provided by the data access object.
   *
   * @member {number} ReadOnlyRootCollection#totalItems
   * @readonly
   */
  get totalItems() {
    return _totalItems.get( this );
  }

  /**
   * The name of the model type.
   *
   * @member {string} ReadOnlyRootCollection.modelType
   * @default ReadOnlyRootCollection
   * @readonly
   */
  static get modelType() {
    return ModelType.ReadOnlyRootCollection;
  }

  //endregion

  //region Transfer object methods

  /**
   * Transforms the business object collection to a plain object array to send to the client.
   *
   * @function ReadOnlyRootCollection#toCto
   * @returns {Array.<object>} The client transfer object.
   */
  toCto() {
    const extensions = _extensions.get( this );
    if (extensions.toCto)
      return extensions.toCto.call( this, getTransferContext() );
    else
      return baseToCto.call( this );
  }

  //endregion

  //region Actions

  /**
   * Initializes a business object collection to be retrieved from the repository.
   * <br/>_This method is called by a factory method with the same name._
   *
   * @function ReadOnlyRootCollection#fetch
   * @protected
   * @param {*} [filter] - The filter criteria.
   * @param {string} [method] - An alternative fetch method of the data access object.
   * @returns {Promise.<ReadOnlyRootCollection>} Returns a promise to the retrieved read-only root collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The method must be a string or null.
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The callback must be a function.
   * @throws {@link bo.rules.AuthorizationError Authorization error}:
   *      The user has no permission to execute the action.
   * @throws {@link bo.common.DataPortalError Data portal error}:
   *      Fetching the business object has failed.
   */
  fetch( filter, method ) {
    method = Argument.inMethod( this.$modelName, 'fetch' ).check( method ).forOptional( 'method' ).asString();
    return data_fetch.call( this, filter, method || M_FETCH );
  }

  //endregion

  //region Validation methods

  /**
   * Indicates whether all the validation rules of the business objects in the
   * collection, including the ones of their child objects, succeeds. A valid collection
   * may have broken rules with severity of success, information and warning.
   *
   * _By default read-only business object collections are supposed to be valid._
   *
   * @function ReadOnlyRootCollection#isValid
   * @returns {boolean} True when the business object is valid, otherwise false.
   */
  isValid() {
    const items = _items.get( this );
    return items.every( item => {
      return item.isValid();
    } );
  }

  /**
   * Executes all the validation rules of all business objects in the collection,
   * including the ones of their child objects.
   *
   * _By default read-only business object collections are supposed to be valid._
   *
   * @function ReadOnlyRootCollection#checkRules
   */
  checkRules() {
    const brokenRules = _brokenRules.get( this );
    brokenRules.clear();

    const items = _items.get( this );
    items.forEach( item => {
      item.checkRules();
    } );

    _brokenRules.set( this, brokenRules );
    _isValidated.set( this, true );
  }

  /**
   * Gets the broken rules of the business object collection.
   *
   * _By default read-only business object collections are supposed to be valid._
   *
   * @function ReadOnlyRootCollection#getBrokenRules
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesOutput} The broken rules of the business object collection.
   */
  getBrokenRules( namespace ) {
    const brokenRules = _brokenRules.get( this );
    let bro = brokenRules.output( namespace );

    // const items = _items.get( this );
    // items.forEach( item => {
    //   const childBrokenRules = item.getBrokenRules( namespace );
    //   if (childBrokenRules)
    //     bro.addChild( this.$modelName, childBrokenRules );
    // } );

    bro = getChildBrokenRules.call( this, namespace, bro );
    return bro.$length ? bro : null;
  }

  /**
   * Gets the response to send to the client in case of broken rules.
   *
   * _By default read-only business object collections are supposed to be valid._
   *
   * @function ReadOnlyRootCollection#getResponse
   * @param {string} [message] - Human-readable description of the reason of the failure.
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesResponse} The broken rules response to send to the client.
   */
  getResponse( message, namespace ) {
    const output = this.getBrokenRules( namespace );
    return output ? new config.brokenRulesResponse( output, message ) : null;
  };

  //endregion

  //region Public array methods

  /**
   * Gets a collection item at a specific position.
   *
   * @function ReadOnlyRootCollection#at
   * @param {number} index - The index of the required item in the collection.
   * @returns {ReadOnlyChildObject} The required collection item.
   */
  at( index ) {
    const items = _items.get( this );
    return items[ index ];
  }

  /**
   * Executes a provided function once per collection item.
   *
   * @function ReadOnlyRootCollection#forEach
   * @param {external.cbCollectionItem} callback - Function that produces an item of the new collection.
   */
  forEach( callback ) {
    const items = _items.get( this );
    items.forEach( callback );
  }

  /**
   * Tests whether all items in the collection pass the test implemented by the provided function.
   *
   * @function ReadOnlyRootCollection#every
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {boolean} True when callback returns truthy value for each item, otherwise false.
   */
  every( callback ) {
    const items = _items.get( this );
    return items.every( callback );
  }

  /**
   * Tests whether some item in the collection pass the test implemented by the provided function.
   *
   * @function ReadOnlyRootCollection#some
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {boolean} True when callback returns truthy value for some item, otherwise false.
   */
  some( callback ) {
    const items = _items.get( this );
    return items.some( callback );
  }

  /**
   * Creates a new array with all collection items that pass the test
   * implemented by the provided function.
   *
   * @function ReadOnlyRootCollection#filter
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {Array.<ReadOnlyChildObject>} The new array of collection items.
   */
  filter( callback ) {
    const items = _items.get( this );
    return items.filter( callback );
  }

  /**
   * Creates a new array with the results of calling a provided function
   * on every item in this collection.
   *
   * @function ReadOnlyRootCollection#map
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {Array.<*>} The new array of callback results.
   */
  map( callback ) {
    const items = _items.get( this );
    return items.map( callback );
  }

  /**
   * Sorts the items of the collection in place and returns the collection.
   *
   * @function ReadOnlyRootCollection#sort
   * @param {external.cbCompare} [fnCompare] - Function that defines the sort order.
   *      If omitted, the collection is sorted according to each character's Unicode
   *      code point value, according to the string conversion of each item.
   * @returns {ReadOnlyRootCollection} The sorted collection.
   */
  sort( fnCompare ) {
    const items = _items.get( this );
    const sorted = items.sort( fnCompare );
    _items.set( this, sorted );
    return sorted;
  }

  //endregion
}

/**
 * Factory class to create definitions of read-only root collections.
 *
 * @name bo.ReadOnlyRootCollection
 */
class ReadOnlyRootCollectionFactory {

  //region Constructor

  /**
   * Creates definition for a read-only root collection.
   *
   *    Valid collection item types are:
   *
   *      * ReadOnlyChildObject
   *
   * @param {string} name - The name of the collection.
   * @param {ReadOnlyChildObject} itemType - The model type of the collection items.
   * @param {bo.common.RuleManager} rules - The validation and authorization rules.
   * @param {bo.common.ExtensionManager} extensions - The customization of the collection.
   * @returns {ReadOnlyRootCollection} The constructor of a read-only root collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The collection name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The rules must be a RuleManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The extensions must be a ExtensionManager object.
   * @throws {@link bo.common.ModelError Model error}: The item type must be an ReadOnlyChildObject.
   */
  constructor( name, itemType, rules, extensions ) {
    const check = Argument.inConstructor( ModelType.ReadOnlyRootCollection );

    name = check( name ).forMandatory( 'name' ).asString();
    rules = check( rules ).forMandatory( 'rules' ).asType( RuleManager );
    extensions = check( extensions ).forMandatory( 'extensions' ).asType( ExtensionManager );

    // Verify the model type of the items.
    if (itemType.modelType !== ModelType.ReadOnlyChildObject)
      throw new ModelError( 'invalidItem',
        itemType.prototype.name, itemType.modelType,
        ModelType.ReadOnlyRootCollection, ModelType.ReadOnlyChildObject );

    // Create model definition.
    const Model = ReadOnlyRootCollection.bind( undefined, name, itemType, rules, extensions );

    //region Factory methods

    /**
     * The name of the model type.
     *
     * @member {string} ReadOnlyRootCollection.modelType
     * @default ReadOnlyRootCollection
     * @readonly
     */
    Model.modelType = ModelType.ReadOnlyRootCollection;

    /**
     * Retrieves a read-only business object collection from the repository.
     *
     * @function ReadOnlyRootCollection.fetch
     * @param {*} [filter] - The filter criteria.
     * @param {string} [method] - An alternative fetch method of the data access object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {Promise.<ReadOnlyRootCollection>} Returns a promise to the retrieved read-only root collection.
     *
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The method must be a string or null.
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The event handlers must be an EventHandlerList object or null.
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The callback must be a function.
     * @throws {@link bo.rules.AuthorizationError Authorization error}:
     *      The user has no permission to execute the action.
     * @throws {@link bo.common.DataPortalError Data portal error}:
     *      Fetching the business object collection has failed.
     */
    Model.fetch = function ( filter, method, eventHandlers ) {
      const instance = new Model( eventHandlers );
      return instance.fetch( filter, method );
    };

    //endregion

    // Immutable definition class.
    Object.freeze( Model );
    return Model;
  }

  //endregion
}
// Immutable factory class.
Object.freeze( ReadOnlyRootCollectionFactory );

export default ReadOnlyRootCollectionFactory;
