'use strict';

//region Imports

import config from './system/configuration.js';
import Argument from './system/argument-check.js';

import ModelBase from './common/model-base.js';
import ModelType from './common/model-type.js';
import ModelError from './common/model-error.js';
import ExtensionManager from './common/extension-manager.js';
import EventHandlerList from './common/event-handler-list.js';
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

import WebPortal from './web-access/web-portal.js';
import WebPortalAction from './web-access/web-portal-action.js';
import WebPortalEvent from './web-access/web-portal-event.js';
import WebPortalEventArgs from './web-access/web-portal-event-args.js';
import WebPortalError from './web-access/web-portal-error.js';

import MODEL_STATE from './common/model-state.js';

//endregion

//region Private variables

const MODEL_DESC = 'Editable child object';
const M_FETCH = WebPortalAction.getName( WebPortalAction.fetch );

const _properties = new WeakMap();
const _rules = new WeakMap();
const _extensions = new WeakMap();
const _parent = new WeakMap();
const _eventHandlers = new WeakMap();
const _propertyContext = new WeakMap();
const _store = new WeakMap();
const _state = new WeakMap();
const _isDirty = new WeakMap();
const _isValidated = new WeakMap();
const _brokenRules = new WeakMap();

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
    propagateChange.call( this ); // up to the parent
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
    propagateChange.call( this ); // up to the parent
    _isValidated.set( this, false );
  }
  else if (state === MODEL_STATE.created) {
    _isDirty.set( this, isDirty || itself );
    propagateChange.call( this ); // up to the parent
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
    propagateChange.call( this ); // up to the parent
  }
  else if (state === MODEL_STATE.created)
    _state.set( this, MODEL_STATE.removed );
  else if (state !== MODEL_STATE.markedForRemoval)
    illegal.call( this, MODEL_STATE.markedForRemoval );
}

function illegal( newState ) {
  const state = _state.get( this );
  throw new ModelError(
    'transition',
    (state == null ? 'NULL' : MODEL_STATE.getName( state )),
    MODEL_STATE.getName( newState )
  );
}

function propagateChange() {
  const parent = _parent.get( this );
  parent.childHasChanged();
}

function propagateRemoval() {
  const properties = _properties.get( this );
  properties.children().forEach( property => {
    const child = getPropertyValue.call( this, property );
    child.remove();
  } );
}

//endregion

//region Transfer object methods

function getTransferContext( authorize ) {
  const properties = _properties.get( this );

  return authorize ?
    new ClientTransferContext(
      properties.toArray(),
      readPropertyValue.bind( this ),
      writePropertyValue.bind( this )
    ) :
    new DataTransferContext(
      properties.toArray(),
      getPropertyValue.bind( this ),
      setPropertyValue.bind( this )
    );
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

function canBeWritten( property ) {
  const rules = _rules.get( this );
  return rules.hasPermission(
    getAuthorizationContext.call( this, AuthorizationAction.writeProperty, property.name )
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

function createChildren() {
  const self = this;
  const properties = _properties.get( this );
  return Promise.all( properties.children().map( property => {
    const child = getPropertyValue.call( self, property );
    return child instanceof ModelBase ?
      child.create() :
      Promise.resolve( null );
  } ) );
}

function fetchChildren( dto ) {
  const self = this;
  const properties = _properties.get( this );
  return Promise.all( properties.children().map( property => {
    const child = getPropertyValue.call( self, property );
    return child.fetch( dto[ property.name ] );
  } ) );
}

function childrenAreValid() {
  const properties = _properties.get( this );
  return properties.children().every( property => {
    const child = getPropertyValue.call( this, property );
    return child.isValid();
  } );
}

function checkChildRules() {
  const properties = _properties.get( this );
  properties.children().forEach( property => {
    const child = getPropertyValue.call( this, property );
    child.checkRules();
  } );
}

function getChildBrokenRules( namespace, bro ) {
  const properties = _properties.get( this );
  properties.children().forEach( ( property, index ) => {
    const child = getPropertyValue.call( this, property );
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
  if (store.setValue( property, value )) {
    _store.set( this, store );
    markAsChanged.call( this, true );
  }
}

function readPropertyValue( property ) {
  if (canBeRead.call( this, property )) {
    const store = _store.get( this );
    return property.getter ?
      property.getter( getPropertyContext.call( this, property ) ) :
      store.getValue( property );
  }
  else
    return null;
}

function writePropertyValue( property, value ) {
  if (canBeWritten.call( this, property )) {
    let changed = false;
    if (property.setter)
      changed = property.setter( getPropertyContext.call( this, property ), value );
    else {
      const store = _store.get( this );
      changed = store.setValue( property, value );
      _store.set( this, store );
    }
    if (changed === true)
      markAsChanged.call( this, true );
  }
}

function getPropertyContext( primaryProperty ) {
  let propertyContext = _propertyContext.get( this );
  if (!propertyContext) {
    const properties = _properties.get( this );
    propertyContext = new PropertyContext(
      this.$modelName,
      properties.toArray(),
      readPropertyValue.bind( this ),
      writePropertyValue.bind( this )
    );
    _propertyContext.set( this, propertyContext );
  }
  return propertyContext.with( primaryProperty );
}

//endregion

//region Initialization

function initialize( name, properties, rules, extensions, parent, eventHandlers ) {
  const check = Argument.inConstructor( name );

  // Verify the model type of the parent model.
  parent = check( parent ).for( 'parent' ).asModelType( [
    ModelType.EditableRootCollection,
    ModelType.EditableChildCollection,
    ModelType.EditableRootObject,
    ModelType.EditableChildObject
  ] );

  eventHandlers = check( eventHandlers ).forOptional( 'eventHandlers' ).asType( EventHandlerList );

  // Set up business rules.
  rules.initialize( config.noAccessBehavior );

  // Set up event handlers.
  if (eventHandlers)
    eventHandlers.setup( this );

  // Create properties.
  const store = new DataStore();
  properties.map( property => {

    const isNormal = property.type instanceof DataType; // Not child element.
    if (isNormal) {
      // Initialize normal property.
      store.initValue( property );
      // Add data type check.
      rules.add( new DataTypeRule( property ) );
    }
    else
    // Create child item/collection.
      store.initValue( property, property.type.empty( this, eventHandlers ) );

    // Create property.
    Object.defineProperty( this, property.name, {
      get: () => {
        return readPropertyValue.call( this, property );
      },
      set: value => {
        if (!isNormal || property.isReadOnly)
          throw new ModelError( 'readOnly', name, property.name );
        writePropertyValue.call( this, property, value );
      },
      enumerable: true
    } );
  } );

  // Initialize instance state.
  _properties.set( this, properties );
  _rules.set( this, rules );
  _extensions.set( this, extensions );
  _parent.set( this, parent );
  _eventHandlers.set( this, eventHandlers );
  _store.set( this, store );
  _propertyContext.set( this, null );
  _state.set( this, null );
  _isDirty.set( this, false );
  _isValidated.set( this, false );
  _brokenRules.set( this, new BrokenRuleList( name ) );

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
    WebPortalEvent.getName( event ),
    new WebPortalEventArgs( event, this.$modelName, null, methodName, error )
  );
}

function wrapError( action, error ) {
  return new WebPortalError( MODEL_DESC, this.$modelName, action, error );
}

//endregion

//region Create

function data_create() {
  const self = this;
  return new Promise( ( fulfill, reject ) => {
    if (false /* this.$hasCreate() */) {
      // Launch start event.
      /**
       * The event arises before the business object instance will be initialized in the repository.
       * @event EditableChildObject#preCreate
       * @param {bo.webAccess.WebPortalEventArgs} eventArgs - Data portal event arguments.
       * @param {EditableChildObject} oldObject - The instance of the model before the data portal action.
       */
      raiseEvent.call( self, WebPortalEvent.preCreate );
      // Execute creation.
      WebPortal.call( self.$modelUri, 'create', null, null )
        .then( dto => {
          fromDto.call( self, dto );
        } )
        .then( none => {
          // Create children as well.
          return createChildren.call( self );
        } )
        .then( none => {
          markAsCreated.call( self );
          // Launch finish event.
          /**
           * The event arises after the business object instance has been initialized in the repository.
           * @event EditableChildObject#postCreate
           * @param {bo.webAccess.WebPortalEventArgs} eventArgs - Data portal event arguments.
           * @param {EditableChildObject} newObject - The instance of the model after the data portal action.
           */
          raiseEvent.call( self, WebPortalEvent.postCreate );
          // Return the new editable child object.
          fulfill( self );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, WebPortalAction.create, reason );
          // Launch finish event.
          raiseEvent.call( self, WebPortalEvent.postCreate, null, dpe );
          // Pass the error.
          reject( dpe );
        } );
    } else {
      markAsCreated.call( self );
      // Nothing to do.
      fulfill( self );
    }
  } );
}

//endregion

//region Fetch

function data_fetch( data, method ) {
  const self = this;
  return new Promise( ( fulfill, reject ) => {
    // Check permissions.
    if (method === M_FETCH ?
        canDo.call( self, AuthorizationAction.fetchObject ) :
        canExecute.call( self, method )) {

      // Launch start event.
      /**
       * The event arises before the business object instance will be retrieved from the repository.
       * @event EditableChildObject#preFetch
       * @param {bo.webAccess.WebPortalEventArgs} eventArgs - Data portal event arguments.
       * @param {EditableChildObject} oldObject - The instance of the model before the data portal action.
       */
      raiseEvent.call( self, WebPortalEvent.preFetch, method );
      // Execute fetch.
      new Promise( ( f, r ) => {
          fromDto.call( self, data );
          f( data );
        } )
        .then( none => {
          // Fetch children as well.
          return fetchChildren.call( self, data );
        } )
        .then( none => {
          markAsPristine.call( self );
          // Launch finish event.
          /**
           * The event arises after the business object instance has been retrieved from the repository.
           * @event EditableChildObject#postFetch
           * @param {bo.webAccess.WebPortalEventArgs} eventArgs - Data portal event arguments.
           * @param {EditableChildObject} newObject - The instance of the model after the data portal action.
           */
          raiseEvent.call( self, WebPortalEvent.postFetch, method );
          // Return the fetched editable child object.
          fulfill( self );
        } )
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, WebPortalAction.fetch, reason );
          // Launch finish event.
          raiseEvent.call( self, WebPortalEvent.postFetch, method, dpe );
          // Pass the error.
          reject( dpe );
        } );
    }
  } );
}

//endregion

//endregion

/**
 * Represents the definition of an asynchronous editable child object.
 *
 * @name EditableChildObject
 * @extends ModelBase
 *
 * @fires EditableChildObject#preCreate
 * @fires EditableChildObject#postCreate
 * @fires EditableChildObject#preFetch
 * @fires EditableChildObject#postFetch
 * @fires EditableChildObject#preInsert
 * @fires EditableChildObject#postInsert
 * @fires EditableChildObject#preUpdate
 * @fires EditableChildObject#postUpdate
 * @fires EditableChildObject#preRemove
 * @fires EditableChildObject#postRemove
 */
class EditableChildObject extends ModelBase {

  //region Constructor

  /**
   * Creates a new asynchronous editable child object instance.
   *
   * _The name of the model type available as:
   * __&lt;instance&gt;.constructor.modelType__, returns 'EditableChildObject'._
   *
   * Valid parent model types are:
   *
   *   * EditableRootCollection
   *   * EditableChildCollection
   *   * EditableRootObject
   *   * EditableChildObject
   *
   * @param {string} uri - The URI of the model.
   * @param {object} parent - The parent business object.
   * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The parent object must be an EditableChildCollection, EditableRootObject or
   *    EditableChildObject instance.
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The event handlers must be an EventHandlerList object or null.
   */
  constructor( name, uri, properties, rules, extensions, parent, eventHandlers ) {
    super();

    /**
     * The name of the model. However, it can be hidden by a model property with the same name.
     *
     * @member {string} EditableChildObject#$modelName
     * @readonly
     */
    this.$modelName = name;
    /**
     * The URI of the model.
     *
     * @member {string} EditableChildObject#$modelUri
     * @readonly
     */
    this.$modelUri = uri;

    // Initialize the instance.
    initialize.call( this, name, properties, rules, extensions, parent, eventHandlers );
  }

  //endregion

  //region Properties

  /**
   * The name of the model type.
   *
   * @member {string} EditableChildObject.modelType
   * @default EditableChildObject
   * @readonly
   */
  static get modelType() {
    return ModelType.EditableChildObject;
  }

  //endregion

  //region Mark object state

  /**
   * Notes that a child object has changed.
   * <br/>_This method is called by child objects._
   *
   * @function EditableChildObject#childHasChanged
   * @protected
   */
  childHasChanged() {
    markAsChanged.call( this, false );
  }

  //endregion

  //region Show object state

  /**
   * Gets the state of the model. Valid states are:
   * pristine, created, changed, markedForRemoval and removed.
   *
   * @function EditableChildObject#getModelState
   * @returns {string} The state of the model.
   */
  getModelState() {
    return MODEL_STATE.getName( _state.get( this ) );
  }

  /**
   * Indicates whether the business object has been created newly and
   * not has been yet saved, i.e. its state is created.
   *
   * @function EditableChildObject#isNew
   * @returns {boolean} True when the business object is new, otherwise false.
   */
  isNew() {
    return _state.get( this ) === MODEL_STATE.created;
  }

  /**
   * Indicates whether the business object itself or any of its child objects differs the one
   * that is stored in the repository, i.e. its state is created, changed or markedForRemoval.
   *
   * @function EditableChildObject#isDirty
   * @returns {boolean} True when the business object has been changed, otherwise false.
   */
  isDirty() {
    const state = _state.get( this );
    return state === MODEL_STATE.created ||
      state === MODEL_STATE.changed ||
      state === MODEL_STATE.markedForRemoval;
  }

  /**
   * Indicates whether the business object itself, ignoring its child objects, differs the one
   * that is stored in the repository.
   *
   * @function EditableChildObject#isSelfDirty
   * @returns {boolean} True when the business object itself has been changed, otherwise false.
   */
  isSelfDirty() {
    return _isDirty.get( this );
  }

  /**
   * Indicates whether the business object will be deleted from the repository,
   * i.e. its state is markedForRemoval.
   *
   * @function EditableChildObject#isDeleted
   * @returns {boolean} True when the business object will be deleted, otherwise false.
   */
  isDeleted() {
    return _state.get( this ) === MODEL_STATE.markedForRemoval;
  }

  //endregion

  //region Transfer object methods

  /**
   * Determines that the passed data contains current values of the model key.
   *
   * @function EditableChildObject#keyEquals
   * @protected
   * @param {object} data - Data object whose properties can contain the values of the model key.
   * @param {internal~getValue} getPropertyValue - A function that returns
   *    the current value of the given property.
   * @returns {boolean} True when the values are equal, false otherwise.
   */
  keyEquals( data ) {
    const properties = _properties.get( this );
    return properties.keyEquals( data, getPropertyValue.bind( this ) );
  }

  /**
   * Transforms the business object collection to a plain object array to send to the server.
   * <br/>_This method is usually called by the parent object._
   *
   * @function EditableChildCollection#toDto
   * @returns {Array.<object>} The data transfer object.
   */
  toDto() {
    const self = this;
    const dto = {};
    const properties = _properties.get( this );

    properties
      .filter( property => {
        return property.isOnDto;
      } )
      .forEach( property => {
        dto[ property.name ] = getPropertyValue.call( self, property );
      } );

    properties
      .children()
      .forEach( property => {
        dto[ property.name ] = getPropertyValue.call( self, property ).toDto();
      } );

    return dto;
  }

  fromDto( dto ) {
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

    properties
      .children()
      .forEach( property => {
        if (dto.hasOwnProperty( property.name )) {
          getPropertyValue.call( self, property ).fromDto( dto[ property.name ] );
        }
      } );
  }

  //endregion

  //region Actions

  /**
   * Initializes a newly created business object.
   * <br/>_This method is called by the parent object._
   *
   * @function EditableChildObject#create
   * @protected
   * @returns {Promise.<EditableChildObject>} Returns a promise to the new editable child object.
   */
  create() {
    return data_create.call( this );
  }

  /**
   * Initializes a business object with data retrieved from the repository.
   * <br/>_This method is called by the parent object._
   *
   * @function EditableChildObject#fetch
   * @protected
   * @param {object} [data] - The data to load into the business object.
   * @param {string} [method] - An alternative fetch method to check for permission.
   * @returns {Promise.<EditableChildObject>} Returns a promise to the retrieved editable child object.
   */
  fetch( data, method ) {
    return data_fetch.call( this, data, method || M_FETCH );
  }

  /**
   * Marks the business object to be deleted from the repository on next save.
   *
   * @function EditableChildObject#remove
   */
  remove() {
    markForRemoval.call( this );
  }

  //endregion

  //region Validation

  /**
   * Indicates whether all the validation rules of the business object, including
   * the ones of its child objects, succeeds. A valid business object may have
   * broken rules with severity of success, information and warning.
   *
   * _This method is called by the parent object._
   *
   * @function EditableChildObject#isValid
   * @protected
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
   * _This method is called by the parent object._
   *
   * @function EditableChildObject#checkRules
   * @protected
   */
  checkRules() {
    const brokenRules = _brokenRules.get( this );
    brokenRules.clear();
    _brokenRules.set( this, brokenRules );

    const context = new ValidationContext( _store.get( this ), brokenRules );
    const properties = _properties.get( this );
    const rules = _rules.get( this );
    properties.forEach( property => {
      rules.validate( property, context );
    } );
    checkChildRules.call( this );

    _isValidated.set( this, true );
  }

  /**
   * Gets the broken rules of the business object.
   *
   * _This method is called by the parent object._
   *
   * @function EditableChildObject#getBrokenRules
   * @protected
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesOutput} The broken rules of the business object.
   */
  getBrokenRules( namespace ) {
    const brokenRules = _brokenRules.get( this );
    let bro = brokenRules.output( namespace );
    bro = getChildBrokenRules.call( this, namespace, bro );
    return bro.$length ? bro : null;
  }

  //endregion
}

/**
 * Factory method to create definitions of editable child objects.
 *
 * @name bo.EditableChildObject
 */
class EditableChildObjectFactory {

  //region Constructor

  /**
   * Creates a definition for an editable child object.
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
   * @returns {EditableChildObject} The constructor of an asynchronous editable child object.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The properties must be a PropertyManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The rules must be a RuleManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The extensions must be a ExtensionManager object.
   *
   * @throws {@link bo.common.ModelError Model error}:
   *    The child objects must be EditableChildCollection or EditableChildObject instances.
   */
  constructor( name, properties, rules, extensions ) {
    const check = Argument.inConstructor( ModelType.EditableChildObject );

    name = check( name ).forMandatory( 'name' ).asString();
    properties = check( properties ).forMandatory( 'properties' ).asType( PropertyManager );
    rules = check( rules ).forMandatory( 'rules' ).asType( RuleManager );
    extensions = check( extensions ).forMandatory( 'extensions' ).asType( ExtensionManager );

    // Verify the model types of child objects.
    properties.modelName = name;
    properties.verifyChildTypes( [
      ModelType.EditableChildCollection,
      ModelType.EditableChildObject
    ] );

    // Create model definition.
    const Model = EditableChildObject.bind( undefined,
      nameFromPhrase( name ),
      uriFromPhrase( name ),
      properties, rules, extensions );

    /**
     * The name of the model type.
     *
     * @member {string} EditableChildObject.modelType
     * @default EditableChildObject
     * @readonly
     */
    Model.modelType = ModelType.EditableChildObject;

    //region Factory methods

    /**
     * Creates a new uninitialized editable child object instance.
     * <br/>_This method is called by the parent object._
     *
     * @function EditableChildObject.empty
     * @protected
     * @param {object} parent - The parent business object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {EditableChildObject} Returns a new editable child object.
     */
    Model.empty = function ( parent, eventHandlers ) {
      const instance = new Model( parent, eventHandlers );
      markAsCreated.call( instance );
      return instance;
    };

    /**
     * Creates a new editable child object instance.
     * <br/>_This method is called by the parent object._
     *
     * @function EditableChildObject.create
     * @protected
     * @param {object} parent - The parent business object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {Promise.<EditableChildObject>} Returns a promise to the new editable child object.
     *
     * @throws {@link bo.rules.AuthorizationError Authorization error}:
     *      The user has no permission to execute the action.
     * @throws {@link bo.webAccess.WebPortalError Data portal error}:
     *      Creating the business object has failed.
     */
    Model.create = function ( parent, eventHandlers ) {
      const instance = new Model( parent, eventHandlers );
      return instance.create();
    };

    /**
     * Initializes an editable child object width data retrieved from the repository.
     * <br/>_This method is called by the parent object._
     *
     * @function EditableChildObject.load
     * @protected
     * @param {object} parent - The parent business object.
     * @param {object} data - The data to load into the business object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {Promise.<EditableChildObject>} Returns a promise to the retrieved editable child object.
     *
     * @throws {@link bo.rules.AuthorizationError Authorization error}:
     *      The user has no permission to execute the action.
     */
    Model.load = function ( parent, data, eventHandlers ) {
      const instance = new Model( parent, eventHandlers );
      return instance.fetch( data, undefined );
    };

    //endregion

    // Immutable definition class.
    Object.freeze( Model );
    return Model;
  }

  //endregion
}
// Immutable factory class.
Object.freeze( EditableChildObjectFactory );

export default EditableChildObjectFactory;
