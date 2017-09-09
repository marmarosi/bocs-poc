'use strict';

//region Imports

import config from './system/configuration.js';
import Argument from './system/argument-check.js';

import ModelBase from './common/model-base.js';
import ModelType from './common/model-type.js';
import ModelError from './common/model-error.js';
import ExtensionManager from './common/extension-manager.js';
import EventHandlerList from './api-access/event-handler-list.js';
import DataStore from './common/data-store.js';
import DataType from './data-types/data-type.js';

import PropertyManager from './common/property-manager.js';
import PropertyContext from './common/property-context.js';
import ValidationContext from './rules/validation-context.js';
import ClientTransferContext from './common/client-transfer-context.js';
import DataTransferContext from './common/data-transfer-context.js';

import RuleManager from './rules/rule-manager.js';
import DataTypeRule from './rules/data-type-rule.js';
import BrokenRuleList from './rules/broken-rule-list.js';
import AuthorizationAction from './rules/authorization-action.js';
import AuthorizationContext from './rules/authorization-context.js';

import ApiClientAction from './api-access/api-client-action.js';
import ApiClientEvent from './api-access/api-client-event.js';
import ApiClientEventArgs from './api-access/api-client-event-args.js';
import ApiClientError from './api-access/api-client-error.js';

//endregion

//region Private variables

const MODEL_DESC = 'Read-only root object';
const M_FETCH = ApiClientAction.getName( ApiClientAction.fetch );

const _properties = new WeakMap();
const _rules = new WeakMap();
const _extensions = new WeakMap();
const _eventHandlers = new WeakMap();
const _store = new WeakMap();
const _brokenRules = new WeakMap();
const _isValidated = new WeakMap();
const _propertyContext = new WeakMap();
const _aco = new WeakMap();

//endregion

//region Helper methods

//region Transfer object methods

function getTransferContext( authorize ) {
  const properties = _properties.get( this );

  return authorize ?
    new ClientTransferContext( properties.toArray(), readPropertyValue.bind( this ), null ) :
    new DataTransferContext( properties.toArray(), null, setPropertyValue.bind( this ) );
}

function baseFromDto( dto ) {
  const self = this;
  const properties = _properties.get( this );

  properties
    .filter( property => {
      return property.isOnDto;
    } )
    .forEach( property => {
      if (dto.hasOwnProperty( property.name ) && typeof dto[ property.name ] !== 'function') {
        setPropertyValue.call( self, property, dto[ property.name ] );
      }
    } );
}

function fromDto( dto ) {
  const extensions = _extensions.get( this );

  if (extensions.fromDto)
    extensions.fromDto.call( this, getTransferContext.call( this, false ), dto );
  else
    baseFromDto.call( this, dto );
}

//endregion

//region Permissions

function getAuthorizationContext( action, targetName ) {
  return new AuthorizationContext( action, targetName || '', _brokenRules.get( this ) );
}

function canBeRead( property ) {
  const rules = _rules.get( this );
  return rules.hasPermission(
    getAuthorizationContext.call( this, AuthorizationAction.readProperty, property.name )
  );
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

function fetchChildren( dto ) {
  const self = this;
  const properties = _properties.get( this );

  return properties.childCount() ?
    Promise.all( properties.children().map( property => {
      const child = getPropertyValue.call( self, property );
      return child.fetch( dto[ property.name ] );
    } ) ) :
    Promise.resolve( null );
}

function childrenAreValid() {
  const self = this;
  const properties = _properties.get( this );

  return properties.children().every( property => {
    const child = getPropertyValue.call( self, property );
    return child.isValid();
  } );
}

function checkChildRules() {
  const self = this;
  const properties = _properties.get( this );

  properties.children().forEach( property => {
    const child = getPropertyValue.call( self, property );
    child.checkRules();
  } );
}

function getChildBrokenRules( namespace, bro ) {
  const self = this;
  const properties = _properties.get( this );

  properties.children().forEach( property => {
    const child = getPropertyValue.call( self, property );
    const childBrokenRules = child.getBrokenRules( namespace );
    if (childBrokenRules) {
      if (childBrokenRules instanceof Array)
        bro.addChildren( property.name, childBrokenRules );
      else
        bro.addChild( property.name, childBrokenRules );
    }
  } );
  return bro;
}

//endregion

//region Properties

function getPropertyValue( property ) {
  const store = _store.get( this );
  return store.getValue( property );
}

function setPropertyValue( property, value ) {
  const store = _store.get( this );
  store.setValue( property, value );
  _store.set( this, store );
}

function getPropertyContext( primaryProperty ) {
  let propertyContext = _propertyContext.get( this );
  if (!propertyContext) {
    let properties = _properties.get( this );
    propertyContext = new PropertyContext(
      this.$modelName, properties.toArray(), readPropertyValue.bind( this )
    );
    _propertyContext.set( this, propertyContext );
  }
  return propertyContext.with( primaryProperty );
}

function readPropertyValue( property ) {
  if (canBeRead.call( this, property )) {
    if (property.getter)
      return property.getter( getPropertyContext.call( this, property ) );
    else
      return getPropertyValue.call( this, property );
  } else
    return null;
}

//endregion

//region Initialization

function initialize( name, properties, rules, extensions, eventHandlers ) {

  eventHandlers = Argument.inConstructor( name )
    .check( eventHandlers ).forOptional( 'eventHandlers' ).asType( EventHandlerList );

  // Set up business rules.
  rules.initialize( config.noAccessBehavior );

  // Set up event handlers.
  if (eventHandlers)
    eventHandlers.setup( this );

  // Create properties.
  const store = new DataStore();
  properties.map( property => {

    if (property.type instanceof DataType) {
      // Initialize normal property.
      store.initValue( property );
      // Add data type check.
      rules.add( new DataTypeRule( property ) );
    }
    else
    // Create child item/collection.
      store.initValue( property, property.type.empty( this, eventHandlers ) );

    Object.defineProperty( this, property.name, {
      get: function () {
        return readPropertyValue.call( this, property );
      },
      set: function ( value ) {
        throw new ModelError( 'readOnly', name, property.name );
      },
      enumerable: true
    } );
  } );

  // Initialize instance state.
  _properties.set( this, properties );
  _rules.set( this, rules );
  _extensions.set( this, extensions );
  _eventHandlers.set( this, eventHandlers );
  _store.set( this, store );
  _brokenRules.set( this, new BrokenRuleList( name ) );
  _isValidated.set( this, false );
  _propertyContext.set( this, null );

  // Get API client object.
  _aco.set( this, extensions.getApiClientObject() );

  // Immutable definition object.
  Object.freeze( this );
}

//endregion

//region Factory

function nameFromPhrase( name ) {
  const colon = name.indexOf( ':' );
  return (colon > 0 ? name.substr( 0, colon ) : name).trim();
}

function uriFromPhrase( name ) {
  const colon = name.indexOf( ':' );
  return (colon > 0 ? name.substr( colon + 1 ) : name).trim();
}

//endregion

//endregion

//region Data portal methods

//region Helper

function raiseEvent( event, methodName, error ) {
  this.emit(
    ApiClientEvent.getName( event ),
    new ApiClientEventArgs( event, this.$modelName, null, methodName, error )
  );
}

function wrapError( error ) {
  return new ApiClientError( MODEL_DESC, this.$modelName, ApiClientAction.fetch, error );
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

      // Launch start event.
      /**
       * The event arises before the business object instance will be retrieved from the repository.
       * @event ReadOnlyRootObject#preFetch
       * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
       * @param {ReadOnlyRootObject} oldObject - The instance of the model before the data portal action.
       */
      raiseEvent.call( self, ApiClientEvent.preFetch, method );
      // Execute fetch.
      // Root element fetches all data of the object tree from API portal.
      const aco = _aco.get( self );
      aco.call( self.$modelUri, 'fetch', method, filter )
        .then( dto => {
          fromDto.call( self, dto );
          return dto;
        } )
        .then( dto => {
          // Fetch children as well.
          return fetchChildren.call( self, dto );
        } )
        .then( none => {
          // Launch finish event.
          /**
           * The event arises after the business object instance has been retrieved from the repository.
           * @event ReadOnlyRootObject#postFetch
           * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
           * @param {ReadOnlyRootObject} newObject - The instance of the model after the data portal action.
           */
          raiseEvent.call( self, ApiClientEvent.postFetch, method );
          // Return the fetched read-only root object.
          fulfill( self );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, reason );
          // Launch finish event.
          raiseEvent.call( self, ApiClientEvent.postFetch, method, dpe );
          // Pass the error.
          reject( dpe );
        } );
    }
  } );
}

//endregion

//endregion

/**
 * Represents the definition of an asynchronous read-only root object.
 *
 * @name ReadOnlyRootObject
 * @extends ModelBase
 *
 * @fires ReadOnlyRootObject#preFetch
 * @fires ReadOnlyRootObject#postFetch
 */
class ReadOnlyRootObject extends ModelBase {

  //region Constructor

  /**
   * Creates a new asynchronous read-only root object instance.
   *
   * _The name of the model type available as:
   * __&lt;instance&gt;.constructor.modelType__, returns 'ReadOnlyRootObject'._
   *
   * @param {string} uri - The URI of the model.
   * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The event handlers must be an EventHandlerList object or null.
   */
  constructor( name, uri, properties, rules, extensions, eventHandlers ) {
    super();

    /**
     * The name of the model. However, it can be hidden by a model property with the same name.
     *
     * @member {string} ReadOnlyRootObject#$modelName
     * @readonly
     */
    this.$modelName = name;
    /**
     * The URI of the model.
     *
     * @member {string} ReadOnlyRootObject#$modelUri
     * @readonly
     */
    this.$modelUri = uri;

    // Initialize the instance.
    initialize.call( this, name, properties, rules, extensions, eventHandlers );
  }

  //endregion

  //region Properties

  /**
   * The name of the model type.
   *
   * @member {string} ReadOnlyRootObject.modelType
   * @default ReadOnlyRootObject
   * @readonly
   */
  static get modelType() {
    return ModelType.ReadOnlyRootObject;
  }

  //endregion

  //region Actions

  /**
   * Initializes a business object to be retrieved from the repository.
   * <br/>_This method is called by a factory method with the same name._
   *
   * @function ReadOnlyRootObject#fetch
   * @protected
   * @param {*} [filter] - The filter criteria.
   * @param {string} [method] - An alternative fetch method of the data access object.
   * @returns {Promise.<ReadOnlyRootObject>} Returns a promise to the retrieved read-only root object.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The method must be a string or null.
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The callback must be a function.
   * @throws {@link bo.rules.AuthorizationError Authorization error}:
   *      The user has no permission to execute the action.
   * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
   *      Fetching the business object has failed.
   */
  fetch( filter, method ) {
    method = Argument.inMethod( this.$modelName, 'fetch' )
      .check( method ).forOptional( 'method' ).asString();
    return data_fetch.call( this, filter, method || M_FETCH );
  }

  //endregion

  //region Validation

  /**
   * Indicates whether all the validation rules of the business object, including
   * the ones of its child objects, succeeds. A valid business object may have
   * broken rules with severity of success, information and warning.
   *
   * _By default read-only business objects are supposed to be valid._
   *
   * @function ReadOnlyRootObject#isValid
   * @returns {boolean} True when the business object is valid, otherwise false.
   */
  isValid() {
    if (!_isValidated.get( this ))
      this.checkRules();

    const brokenRules = _brokenRules.get( this );
    return brokenRules.isValid() && childrenAreValid.call( this );
  }

  /**
   * Executes all the validation rules of the business object, including the ones
   * of its child objects.
   *
   * _By default read-only business objects are supposed to be valid._
   *
   * @function ReadOnlyRootObject#checkRules
   */
  checkRules() {
    const brokenRules = _brokenRules.get( this );
    brokenRules.clear();

    const store = _store.get( this );
    const context = new ValidationContext( store, brokenRules );

    const properties = _properties.get( this );
    const rules = _rules.get( this );
    properties.forEach( property => {
      rules.validate( property, context );
    } );
    checkChildRules.call( this );

    _brokenRules.set( this, brokenRules );
    _isValidated.set( this, true );
  }

  /**
   * Gets the broken rules of the business object.
   *
   * _By default read-only business objects are supposed to be valid._
   *
   * @function ReadOnlyRootObject#getBrokenRules
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesOutput} The broken rules of the business object.
   */
  getBrokenRules( namespace ) {
    const brokenRules = _brokenRules.get( this );
    let bro = brokenRules.output( namespace );
    bro = getChildBrokenRules.call( this, namespace, bro );
    return bro.$length ? bro : null;
  }

  /**
   * Gets the response to send to the client in case of broken rules.
   *
   * _By default read-only business objects are supposed to be valid._
   *
   * @function ReadOnlyRootObject#getResponse
   * @param {string} [message] - Human-readable description of the reason of the failure.
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesResponse} The broken rules response to send to the client.
   */
  getResponse( message, namespace ) {
    const output = this.getBrokenRules( namespace );
    return output ? new config.brokenRulesResponse( output, message ) : null;
  };

  //endregion
}

/**
 * Factory method to create definitions of asynchronous read-only root objects.
 *
 * @name bo.ReadOnlyRootObject
 */
class ReadOnlyRootObjectFactory {

  //region Constructor

  /**
   * Creates a definition for a read-only root object.
   *
   *    Valid child model types are:
   *
   *      * ReadOnlyChildCollection
   *      * ReadOnlyChildObject
   *
   * @param {string} name - The name of the model.
   * @param {bo.common.PropertyManager} properties - The property definitions.
   * @param {bo.common.RuleManager} rules - The validation and authorization rules.
   * @param {bo.common.ExtensionManager} extensions - The customization of the model.
   * @returns {ReadOnlyRootObject} The constructor of an asynchronous read-only root object.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The properties must be a PropertyManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The rules must be a RuleManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The extensions must be a ExtensionManager object.
   *
   * @throws {@link bo.common.ModelError Model error}:
   *    The child objects must be ReadOnlyChildCollection or ReadOnlyChildObject instances.
   */
  constructor( name, properties, rules, extensions ) {
    const check = Argument.inConstructor( ModelType.ReadOnlyRootObject );

    name = check( name ).forMandatory( 'name' ).asString();
    properties = check( properties ).forMandatory( 'properties' ).asType( PropertyManager );
    rules = check( rules ).forMandatory( 'rules' ).asType( RuleManager );
    extensions = check( extensions ).forMandatory( 'extensions' ).asType( ExtensionManager );

    // Verify the model type of child objects.
    properties.modelName = name;
    properties.verifyChildTypes( [
      ModelType.ReadOnlyChildCollection,
      ModelType.ReadOnlyChildObject
    ] );

    // Create model definition.
    const Model = ReadOnlyRootObject.bind( undefined,
      nameFromPhrase( name ),
      uriFromPhrase( name ),
      properties, rules, extensions );

    /**
     * The name of the model type.
     *
     * @member {string} ReadOnlyRootObject.constructor.modelType
     * @default ReadOnlyRootObject
     * @readonly
     */
    Model.modelType = ModelType.ReadOnlyRootObject;

    //region Factory methods

    /**
     * Retrieves a read-only business object from the repository.
     *
     * @function ReadOnlyRootObject.fetch
     * @param {*} [filter] - The filter criteria.
     * @param {string} [method] - An alternative fetch method of the data access object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {Promise.<ReadOnlyRootObject>} Returns a promise to the retrieved read-only root object.
     *
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The method must be a string or null.
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The event handlers must be an EventHandlerList object or null.
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The callback must be a function.
     * @throws {@link bo.rules.AuthorizationError Authorization error}:
     *      The user has no permission to execute the action.
     * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
     *      Fetching the business object has failed.
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
Object.freeze( ReadOnlyRootObjectFactory );

export default ReadOnlyRootObjectFactory;
