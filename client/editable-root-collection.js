'use strict';

//region Imports

import config from './system/configuration.js';
import Argument from './system/argument-check.js';

import CollectionBase from './common/collection-base.js';
import ModelType from './common/model-type.js';
import ModelError from './common/model-error.js';
import ExtensionManager from './common/extension-manager.js';
import EventHandlerList from './api-access/event-handler-list.js';

import RuleManager from './rules/rule-manager.js';
import BrokenRuleList from './rules/broken-rule-list.js';
import AuthorizationAction from './rules/authorization-action.js';
import AuthorizationContext from './rules/authorization-context.js';

import ApiClientAction from './api-access/api-client-action.js';
import ApiClientEvent from './api-access/api-client-event.js';
import ApiClientEventArgs from './api-access/api-client-event-args.js';
import ApiClientError from './api-access/api-client-error.js';

import MODEL_STATE from './common/model-state.js';

//endregion

//region Private variables

const MODEL_DESC = 'Editable root collection';
const M_FETCH = ApiClientAction.getName( ApiClientAction.fetch );

const _itemType = new WeakMap();
const _rules = new WeakMap();
const _extensions = new WeakMap();
const _eventHandlers = new WeakMap();
const _state = new WeakMap();
const _isDirty = new WeakMap();
const _isValidated = new WeakMap();
const _brokenRules = new WeakMap();
const _items = new WeakMap();
const _filters = new WeakMap();
const _methods = new WeakMap();
const _aco = new WeakMap();

//endregion

//region Helper methods

//region Mark object state

/*
 * From:         To:  | pri | cre | cha | mfr | rem
 * -------------------------------------------------
 * NULL               |  +  |  +  |  N  |  N  |  N
 * -------------------------------------------------
 * pristine           |  o  |  -  |  +  |  +  |  -
 * -------------------------------------------------
 * created            |  +  |  o  |  o  | (-) |  +
 * -------------------------------------------------
 * changed            |  +  |  -  |  o  |  +  |  -
 * -------------------------------------------------
 * markedForRemoval   |  -  |  -  |  o  |  o  |  +
 * -------------------------------------------------
 * removed            |  -  |  -  |  -  |  -  |  o
 * -------------------------------------------------
 *
 * Explanation:
 *   +  :  possible transition
 *   -  :  not allowed transition, throws exception
 *   o  :  no change, no action
 *   N  :  impossible start up, throws exception
 */

function markAsPristine() {
  const state = _state.get( this );
  if (state === MODEL_STATE.markedForRemoval || state === MODEL_STATE.removed)
    illegal.call( this, MODEL_STATE.pristine );
  else if (state !== MODEL_STATE.pristine) {
    _state.set( this, MODEL_STATE.pristine );
    _isDirty.set( this, false );
  }
}

function markAsCreated() {
  const state = _state.get( this );
  if (state === null) {
    _state.set( this, MODEL_STATE.created );
    _isDirty.set( this, true );
  }
  else if (state !== MODEL_STATE.created)
    illegal.call( this, MODEL_STATE.created );
}

function markAsChanged( itself ) {
  const state = _state.get( this );
  const isDirty = _isDirty.get( this );
  if (state === MODEL_STATE.pristine) {
    _state.set( this, MODEL_STATE.changed );
    _isDirty.set( this, isDirty || itself );
    _isValidated.set( this, false );
  }
  else if (state === MODEL_STATE.created) {
    _isDirty.set( this, isDirty || itself );
    _isValidated.set( this, false );
  }
  else if (state === MODEL_STATE.removed)
    illegal.call( this, MODEL_STATE.changed );
}

function markForRemoval() {
  const state = _state.get( this );
  if (state === MODEL_STATE.pristine || state === MODEL_STATE.changed) {
    _state.set( this, MODEL_STATE.markedForRemoval );
    _isDirty.set( this, true );
    propagateRemoval.call( this ); // down to children
  }
  else if (state === MODEL_STATE.created)
    _state.set( this, MODEL_STATE.removed );
  else if (state !== MODEL_STATE.markedForRemoval)
    illegal.call( this, MODEL_STATE.markedForRemoval );
}

function markAsRemoved() {
  const state = _state.get( this );
  if (state === MODEL_STATE.created || state === MODEL_STATE.markedForRemoval) {
    _state.set( this, MODEL_STATE.removed );
    _isDirty.set( this, false );
  }
  else if (state !== MODEL_STATE.removed)
    illegal.call( this, MODEL_STATE.removed );
}

function illegal( newState ) {
  const state = _state.get( this );
  throw new ModelError(
    'transition',
    (state == null ? 'NULL' : MODEL_STATE.getName( state )),
    MODEL_STATE.getName( newState )
  );
}

function propagateRemoval() {
  this.forEach( function ( child ) {
    child.remove();
  } );
}

//endregion

//region Transfer object methods

function toDto() {
  let dto = [];

  _items.get( this )
    .filter( item => {
      return item.getModelState() !== MODEL_STATE.getName( MODEL_STATE.markedForRemoval );
    })
    .forEach( item => {
      dto.push( item.toDto() );
    } );

  return dto;
}

//endregion

//region Permissions

function getAuthorizationContext( action, targetName ) {
  return new AuthorizationContext( action, targetName || '', _brokenRules.get( this ) );
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
  const self = this;
  const itemType = _itemType.get( this );
  const eventHandlers = _eventHandlers.get( this );

  return data instanceof Array && data.length ?
    Promise.all( data.map( dto => {
      return itemType.load( self, dto, eventHandlers )
    } ) )
      .then( list => {
        // Add loaded items to the collection.
        const items = _items.get( self );
        list.forEach( item => {
          items.push( item );
        } );
        _items.set( self, items );
        const itemType = _itemType.get( this );
        // Nothing to return.
        return null;
      } ) :
    Promise.resolve( null );
}

function childrenAreValid() {
  const items = _items.get( this );
  return items.every( item => {
    return item.isValid();
  } );
}

function checkChildRules() {
  this.forEach( item => {
    item.checkRules();
  } );
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
  _state.set( this, null );
  _isDirty.set( this, false );
  _isValidated.set( this, false );
  _brokenRules.set( this, new BrokenRuleList( name ) );
  _items.set( this, [] );

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

function raiseSave( event, action, error ) {
  this.emit(
    ApiClientEvent.getName( event ),
    new ApiClientEventArgs( event, this.$modelName, action, null, error )
  );
}

function wrapError( action, error ) {
  return new ApiClientError( MODEL_DESC, this.$modelName, action, error );
}

//endregion

//region Create

function data_create() {
  const self = this;
  return new Promise( ( fulfill, reject ) => {

    // Launch start event.
    /**
     * The event arises before the business object collection will be initialized in the repository.
     * @event EditableRootCollection#preCreate
     * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
     * @param {EditableRootCollection} oldObject - The instance of the collection before the data portal action.
     */
    raiseEvent.call( self, ApiClientEvent.preCreate );
    // Execute creation - nothing to do.
    markAsCreated.call( self );
    // Launch finish event.
    /**
     * The event arises after the business object collection has been initialized in the repository.
     * @event EditableRootCollection#postCreate
     * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
     * @param {EditableRootCollection} newObject - The instance of the collection after the data portal action.
     */
    raiseEvent.call( self, ApiClientEvent.postCreate );
    // Return the new editable root collection.
    fulfill( self );
  } );
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
       * The event arises before the collection instance will be retrieved from the repository.
       * @event EditableRootCollection#preFetch
       * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
       * @param {EditableRootCollection} oldObject - The collection instance before the data portal action.
       */
      raiseEvent.call( self, ApiClientEvent.preFetch, method );
      // Execute fetch.
      // Root element fetches all data of the object tree from API portal.
      const aco = _aco.get( self );
      aco.call( self.$modelUri, 'fetch', method, filter )
        .then( dto => {
          // Load children.
          return fetchChildren.call( self, dto );
        } )
        .then( none => {
          markAsPristine.call( self );
          // Save initialization data;
          _filters.set( self, filter );
          _methods.set( self, method );
          // Launch finish event.
          /**
           * The event arises after the collection instance has been retrieved from the repository.
           * @event EditableRootCollection#postFetch
           * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
           * @param {EditableRootCollection} newObject - The collection instance after the data portal action.
           */
          raiseEvent.call( self, ApiClientEvent.postFetch, method );
          // Return the fetched editable root collection.
          fulfill( self );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, ApiClientAction.fetch, reason );
          // Launch finish event.
          raiseEvent.call( self, ApiClientEvent.postFetch, method, dpe );
          // Pass the error.
          reject( dpe );
        } );
    }
  } );
}

//endregion

//region Insert

function data_insert() {
  const self = this;
  return new Promise( ( fulfill, reject ) => {
    // Check permissions.
    if (canDo.call( self, AuthorizationAction.createObject )) {

      // Launch start event.
      raiseSave.call( self, ApiClientEvent.preSave, ApiClientAction.insert );
      /**
       * The event arises before the business object collection will be created in the repository.
       * @event EditableRootCollection#preInsert
       * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
       * @param {EditableRootCollection} oldObject - The instance of the collection before the data portal action.
       */
      raiseEvent.call( self, ApiClientEvent.preInsert );
      // Execute insert.
      const aco = _aco.get( self );
      aco.call( self.$modelUri, 'insert', null, toDto.call( self ) )
        .then( none => {
          markAsPristine.call( self );
          // Launch finish event.
          /**
           * The event arises after the business object collection has been created in the repository.
           * @event EditableRootCollection#postInsert
           * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
           * @param {EditableRootCollection} newObject - The instance of the collection after the data portal action.
           */
          raiseEvent.call( self, ApiClientEvent.postInsert );
          raiseSave.call( self, ApiClientEvent.postSave, ApiClientAction.insert );
          // Return the created editable root collection.
          fulfill( self );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, ApiClientAction.insert, reason );
          // Launch finish event.
          raiseEvent.call( self, ApiClientEvent.postInsert, null, dpe );
          raiseSave.call( self, ApiClientEvent.postSave, ApiClientAction.insert, dpe );
          // Pass the error.
          reject( dpe );
        } );
    }
  } );
}

//endregion

//region Update

function data_update() {
  const self = this;
  return new Promise( ( fulfill, reject ) => {
    // Check permissions.
    if (canDo.call( self, AuthorizationAction.updateObject )) {

      // Launch start event.
      raiseSave.call( self, ApiClientEvent.preSave, ApiClientAction.update );
      /**
       * The event arises before the business object collection will be updated in the repository.
       * @event EditableRootCollection#preUpdate
       * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
       * @param {EditableRootCollection} oldObject - The instance of the collection before the data portal action.
       */
      raiseEvent.call( self, ApiClientEvent.preUpdate );
      // Execute update.
      const data = {
        filter: _filters.get( self ),
        method: _methods.get( self ),
        dto: toDto.call( self )
      };
      const aco = _aco.get( self );
      aco.call( self.$modelUri, 'update', null, data )
        .then( none => {
          markAsPristine.call( self );
          // Launch finish event.
          /**
           * The event arises after the business object collection has been updated in the repository.
           * @event EditableRootCollection#postUpdate
           * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
           * @param {EditableRootCollection} newObject - The instance of the collection after the data portal action.
           */
          raiseEvent.call( self, ApiClientEvent.postUpdate );
          raiseSave.call( self, ApiClientEvent.postSave, ApiClientAction.update );
          // Return the updated editable root collection.
          fulfill( self );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, ApiClientAction.update, reason );
          // Launch finish event.
          raiseEvent.call( self, ApiClientEvent.postUpdate, null, dpe );
          raiseSave.call( self, ApiClientEvent.postSave, ApiClientAction.update, dpe );
          // Pass the error.
          reject( dpe );
        } );
    }
  } );
}

//endregion

//region Remove

function data_remove() {
  const self = this;
  return new Promise( ( fulfill, reject ) => {
    // Check permissions.
    if (canDo.call( self, AuthorizationAction.removeObject )) {

      // Launch start event.
      raiseSave.call( self, ApiClientEvent.preSave, ApiClientAction.remove );
      /**
       * The event arises before the business object collection will be removed from the repository.
       * @event EditableRootCollection#preRemove
       * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
       * @param {EditableRootCollection} oldObject - The instance of the collection before the data portal action.
       */
      raiseEvent.call( self, ApiClientEvent.preRemove );
      // Execute removal.
      const data = {
        filter: _filters.get( self ),
        method: _methods.get( self )
      };
      const aco = _aco.get( self );
      aco.call( self.$modelUri, 'remove', null, data )
        .then( none => {
          // Execute removal - nothing to do.
          markAsRemoved.call( self );
          // Launch finish event.
          /**
           * The event arises after the business object collection has been removed from the repository.
           * @event EditableRootCollection#postRemove
           * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
           * @param {EditableRootCollection} newObject - The instance of the collection after the data portal action.
           */
          raiseEvent.call( self, ApiClientEvent.postRemove );
          raiseSave.call( self, ApiClientEvent.postSave, ApiClientAction.remove );
          // Nothing to return;
          fulfill( null );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, ApiClientAction.remove, reason );
          // Launch finish event.
          raiseEvent.call( self, ApiClientEvent.postRemove, null, dpe );
          raiseSave.call( self, ApiClientEvent.postSave, ApiClientAction.remove, dpe );
          // Pass the error.
          reject( dpe );
        } );
    }
  } );
}

//endregion

//endregion

/**
 * Represents the definition of an asynchronous editable root collection.
 *
 * @name EditableRootCollection
 * @extends CollectionBase
 *
 * @fires EditableRootCollection#preCreate
 * @fires EditableRootCollection#postCreate
 * @fires EditableRootCollection#preFetch
 * @fires EditableRootCollection#postFetch
 * @fires EditableRootCollection#preInsert
 * @fires EditableRootCollection#postInsert
 * @fires EditableRootCollection#preUpdate
 * @fires EditableRootCollection#postUpdate
 * @fires EditableRootCollection#preRemove
 * @fires EditableRootCollection#postRemove
 * @fires EditableRootCollection#preSave
 * @fires EditableRootCollection#postSave
 */
class EditableRootCollection extends CollectionBase {

  //region Constructor

  /**
   * Creates a new asynchronous editable root collection instance.
   *
   * _The name of the model type available as:
   * __&lt;instance&gt;.constructor.modelType__, returns 'EditableRootCollection'._
   *
   * @param {string} uri - The URI of the model.
   * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The event handlers must be an EventHandlerList object or null.
   */
  constructor( name, uri, itemType, rules, extensions, eventHandlers ) {
    super();

    /**
     * The name of the model.
     *
     * @member {string} EditableRootCollection#$modelName
     * @readonly
     */
    this.$modelName = name;
    /**
     * The URI of the model.
     *
     * @member {string} EditableRootCollection#$modelUri
     * @readonly
     */
    this.$modelUri = uri;

    // Initialize the instance.
    initialize.call( this, name, itemType, rules, extensions, eventHandlers );
  }

  //endregion

  //region Properties

  /**
   * The count of the child objects in the collection.
   *
   * @member {number} EditableRootCollection#count
   * @readonly
   */
  get count() {
    const items = _items.get( this );
    return items.length;
  }

  /**
   * The name of the model type.
   *
   * @member {string} EditableRootCollection.modelType
   * @default ReadOnlyRootCollection
   * @readonly
   */
  static get modelType() {
    return ModelType.EditableRootCollection;
  }

  //endregion

  //region Mark object state

  /**
   * Notes that a child object has changed.
   * <br/>_This method is called by child objects._
   *
   * @function EditableRootCollection#childHasChanged
   * @protected
   */
  childHasChanged() {
    markAsChanged.call( this, false );
  }

  //endregion

  //region Show object state

  /**
   * Gets the state of the collection. Valid states are:
   * pristine, created, changed, markedForRemoval and removed.
   *
   * @function EditableRootCollection#getModelState
   * @returns {string} The state of the collection.
   */
  getModelState() {
    return MODEL_STATE.getName( _state.get( this ) );
  }

  /**
   * Indicates whether the business object collection has been created newly
   * and not has been yet saved, i.e. its state is created.
   *
   * @function EditableRootCollection#isNew
   * @returns {boolean} True when the business object collection is new, otherwise false.
   */
  isNew() {
    return _state.get( this ) === MODEL_STATE.created;
  }

  /**
   * Indicates whether the business object collection itself or any of its child objects differs the
   * one that is stored in the repository, i.e. its state is created, changed or markedForRemoval.
   *
   * @function EditableRootCollection#isDirty
   * @returns {boolean} True when the business object collection has been changed, otherwise false.
   */
  isDirty() {
    const state = _state.get( this );
    return state === MODEL_STATE.created ||
      state === MODEL_STATE.changed ||
      state === MODEL_STATE.markedForRemoval;
  }

  /**
   * Indicates whether the business object collection itself, ignoring its child objects,
   * differs the one that is stored in the repository.
   *
   * @function EditableRootCollection#isSelfDirty
   * @returns {boolean} True when the business object collection itself has been changed, otherwise false.
   */
  isSelfDirty() {
    return _isDirty.get( this );
  }

  /**
   * Indicates whether the business object collection will be deleted from the repository,
   * i.e. its state is markedForRemoval.
   *
   * @function EditableRootCollection#isDeleted
   * @returns {boolean} True when the business object collection will be deleted, otherwise false.
   */
  isDeleted() {
    return _state.get( this ) === MODEL_STATE.markedForRemoval;
  }

  /**
   * Indicates whether the business object collection can be saved to the repository,
   * i.e. it has ben changed and is valid, and the user has permission to save it.
   *
   * @function EditableRootCollection#isSavable
   * @returns {boolean} True when the user can save the business object collection, otherwise false.
   */
  isSavable() {
    let auth;
    if (this.isDeleted)
      auth = canDo.call( this, AuthorizationAction.removeObject );
    else if (this.isNew)
      auth = canDo.call( this, AuthorizationAction.createObject );
    else
      auth = canDo.call( this, AuthorizationAction.updateObject );
    return auth && this.isDirty && this.isValid();
  }

  //endregion

  //region Actions

  /**
   * Initializes a newly created business object collection.
   * <br/>_This method is called by a factory method with the same name._
   *
   * @function EditableRootCollection#create
   * @protected
   * @returns {Promise.<EditableRootCollection>} Returns a promise to the new editable root collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The callback must be a function.
   * @throws {@link bo.rules.AuthorizationError Authorization error}:
   *      The user has no permission to execute the action.
   * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
   *      Creating the business object collection has failed.
   */
  create() {
    return data_create.call( this );
  }

  /**
   * Creates a new item and adds it to the collection at the specified index.
   *
   * @function EditableRootCollection#create
   * @param {number} [index] - The index of the new item.
   * @returns {Promise.<EditableChildObject>} Returns a promise to the editable child object created.
   */
  createItem( index ) {
    const self = this;
    const itemType = _itemType.get( this );
    const eventHandlers = _eventHandlers.get( this );

    return itemType.create( this, eventHandlers )
      .then( item => {
        const items = _items.get( self );
        let ix = parseInt( index, 10 );
        ix = isNaN( ix ) ? items.length : ix;
        items.splice( ix, 0, item );
        _items.set( self, items );
        return item;
      } );
  }

  /**
   * Initializes a business object collection to be retrieved from the repository.
   * <br/>_This method is called by a factory method with the same name._
   *
   * @function EditableRootCollection#fetch
   * @protected
   * @param {*} [filter] - The filter criteria.
   * @param {string} [method] - An alternative fetch method of the data access object.
   * @returns {Promise.<EditableRootCollection>} Returns a promise to the retrieved editable root collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The method must be a string or null.
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The callback must be a function.
   * @throws {@link bo.rules.AuthorizationError Authorization error}:
   *      The user has no permission to execute the action.
   * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
   *      Fetching the business object collection has failed.
   */
  fetch( filter, method ) {
    method = Argument.inMethod( this.$modelName, 'fetch' )
      .check( method ).forOptional( 'method' ).asString();
    return data_fetch.call( this, filter, method || M_FETCH );
  }

  /**
   * Saves the changes of the business object collection to the repository.
   *
   * @function EditableRootCollection#save
   * @return {Promise.<EditableRootCollection>} Returns a promise to the saved editable root collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The callback must be a function.
   * @throws {@link bo.rules.AuthorizationError Authorization error}:
   *      The user has no permission to execute the action.
   * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
   *      Inserting the business object collection has failed.
   * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
   *      Updating the business object collection has failed.
   * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
   *      Deleting the business object collection has failed.
   */
  save() {
    const self = this;

    function expelRemovedItems() {
      let items = _items.get( self );
      items = items.filter( item => {
        return item.getModelState() !== MODEL_STATE.getName( MODEL_STATE.markedForRemoval );
      } );
      _items.set( self, items );
    }

    return new Promise( ( fulfill, reject ) => {
      if (self.isValid()) {
        /**
         * The event arises before the business object collection will be saved in the repository.
         * The event is followed by a preInsert, preUpdate or preRemove event depending on the
         * state of the business object collection.
         * @event EditableRootCollection#preSave
         * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
         * @param {EditableRootCollection} oldObject - The instance of the collection before the data portal action.
         */
        let state = _state.get( self );
        switch (state) {
          case MODEL_STATE.created:
            data_insert.call( self )
              .then( inserted => {
                fulfill( inserted );
              } );
            break;
          case MODEL_STATE.changed:
            data_update.call( self )
              .then( updated => {
                expelRemovedItems();
                fulfill( updated );
              } );
            break;
          case MODEL_STATE.markedForRemoval:
            data_remove.call( self )
              .then( removed => {
                expelRemovedItems();
                fulfill( removed );
              } );
            break;
          default:
            fulfill( self );
        }
        /**
         * The event arises after the business object collection has been saved in the repository.
         * The event is preceded by a postInsert, postUpdate or postRemove event depending on the
         * state of the business object collection.
         * @event EditableRootCollection#postSave
         * @param {bo.apiAccess.ApiClientEventArgs} eventArgs - Data portal event arguments.
         * @param {EditableRootCollection} newObject - The instance of the collection after the data portal action.
         */
      }
    } );
  }

  /**
   * Marks the business object collection to be deleted from the repository on next save.
   *
   * @function EditableRootCollection#remove
   */
  remove() {
    markForRemoval.call( this );
  }

  //endregion

  //region Validation

  /**
   * Indicates whether all validation rules of all business objects of the
   * collection succeeds. A valid business object collection may have
   * broken rules with severity of success, information and warning.
   *
   * @function EditableRootCollection#isValid
   * @returns {boolean} True when the business object collection is valid, otherwise false.
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
   * @function EditableRootCollection#checkRules
   */
  checkRules() {
    const brokenRules = _brokenRules.get( this );
    brokenRules.clear();
    _brokenRules.set( this, brokenRules );

    checkChildRules.call( this );

    _isValidated.set( this, true );
  }

  /**
   * Gets the broken rules of the business object.
   *
   * @function EditableRootCollection#getBrokenRules
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesOutput} The broken rules of the business object.
   */
  getBrokenRules( namespace ) {
    const brokenRules = _brokenRules.get( this );
    let bro = brokenRules.output( namespace );
    bro = getChildBrokenRules.call( this, namespace, bro );
    return bro.$length ? bro : null;
  };

  /**
   * Gets the response to send to the client in case of broken rules.
   *
   * @function EditableRootCollection#getResponse
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
   * @function EditableRootCollection#at
   * @param {number} index - The index of the required item in the collection.
   * @returns {EditableChildObject} The required collection item.
   */
  at( index ) {
    const items = _items.get( this );
    return items[ index ];
  }

  /**
   * Executes a provided function once per collection item.
   *
   * @function EditableRootCollection#forEach
   * @param {external.cbCollectionItem} callback - Function that produces an item of the new collection.
   */
  forEach( callback ) {
    const items = _items.get( this );
    items.forEach( callback );
  }

  /**
   * Tests whether all items in the collection pass the test implemented by the provided function.
   *
   * @function EditableRootCollection#every
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
   * @function EditableRootCollection#some
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
   * @function EditableRootCollection#filter
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {Array.<EditableChildObject>} The new array of collection items.
   */
  filter( callback ) {
    const items = _items.get( this );
    return items.filter( callback );
  }

  /**
   * Creates a new array with the results of calling a provided function
   * on every item in this collection.
   *
   * @function EditableRootCollection#map
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
   * @function EditableRootCollection#sort
   * @param {external.cbCompare} [fnCompare] - Function that defines the sort order.
   *      If omitted, the collection is sorted according to each character's Unicode
   *      code point value, according to the string conversion of each item.
   * @returns {Array.<EditableChildObject>} The sorted collection.
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
 * Factory method to create definitions of editable root collections.
 *
 * @name bo.EditableRootCollection
 */
class EditableRootCollectionFactory {

  //region Constructor

  /**
   * Creates a definition for an editable root collection.
   *
   *    Valid collection item types are:
   *
   *      * EditableChildObject
   *
   * @param {string} name - The name of the collection.
   * @param {EditableChildObject} itemType - The model type of the collection items.
   * @param {bo.common.RuleManager} rules - The authorization rules.
   * @param {bo.common.ExtensionManager} extensions - The customization of the collection.
   * @returns {EditableRootCollection} The constructor of an asynchronous editable root collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The collection name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The rules must be a RuleManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The extensions must be a ExtensionManager object.
   * @throws {@link bo.common.ModelError Model error}: The item type must be an EditableChildObject.
   */
  constructor( name, itemType, rules, extensions ) {
    const check = Argument.inConstructor( ModelType.EditableRootCollection );

    name = check( name ).forMandatory( 'name' ).asString();
    rules = check( rules ).forMandatory( 'rules' ).asType( RuleManager );
    extensions = check( extensions ).forMandatory( 'extensions' ).asType( ExtensionManager );

    // Verify the model type of the item type.
    if (itemType.modelType !== ModelType.EditableChildObject)
      throw new ModelError( 'invalidItem',
        itemType.prototype.name, itemType.modelType,
        ModelType.EditableRootCollection, ModelType.EditableChildObject );

    // Create model definition.
    const Model = EditableRootCollection.bind( undefined,
      nameFromPhrase( name ),
      uriFromPhrase( name ),
      itemType, rules, extensions );

    /**
     * The name of the model type.
     *
     * @member {string} EditableRootCollection.modelType
     * @default EditableRootCollection
     * @readonly
     */
    Model.modelType = ModelType.EditableRootCollection;

    //region Factory methods

    /**
     * Creates a new editable business object collection.
     *
     * @function EditableRootCollection.create
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {Promise.<EditableRootCollection>} Returns a promise to the new editable root collection.
     *
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The event handlers must be an EventHandlerList object or null.
     * @throws {@link bo.rules.AuthorizationError Authorization error}:
     *      The user has no permission to execute the action.
     * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
     *      Creating the business object collection has failed.
     */
    Model.create = function ( eventHandlers ) {
      const instance = new Model( eventHandlers );
      return instance.create();
    };

    /**
     * Retrieves an editable business object collection from the repository.
     *
     * @function EditableRootCollection.fetch
     * @param {*} [filter] - The filter criteria.
     * @param {string} [method] - An alternative fetch method of the data access object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {Promise.<EditableRootCollection>} Returns a promise to the retrieved editable root collection.
     *
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The method must be a string or null.
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The event handlers must be an EventHandlerList object or null.
     * @throws {@link bo.rules.AuthorizationError Authorization error}:
     *      The user has no permission to execute the action.
     * @throws {@link bo.apiAccess.ApiClientError Data portal error}:
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
Object.freeze( EditableRootCollectionFactory );

export default EditableRootCollectionFactory;
