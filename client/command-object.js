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
import DataTransferContext from './common/data-transfer-context.js';

import RuleManager from './rules/rule-manager.js';
import DataTypeRule from './rules/data-type-rule.js';
import BrokenRuleList from './rules/broken-rule-list.js';
import AuthorizationAction from './rules/authorization-action.js';
import AuthorizationContext from './rules/authorization-context.js';
import BrokenRulesResponse from './rules/broken-rules-response.js';

import WebPortal from './web-access/web-portal.js';
import WebPortalAction from './web-access/web-portal-action.js';
import WebPortalEvent from './web-access/web-portal-event.js';
import WebPortalEventArgs from './web-access/web-portal-event-args.js';
import WebPortalError from './web-access/web-portal-error.js';

//endregion

//region Private variables

const MODEL_DESC = 'Command object';
const M_EXECUTE = WebPortalAction.getName(WebPortalAction.execute);

const _properties = new WeakMap();
const _rules = new WeakMap();
const _extensions = new WeakMap();
const _eventHandlers = new WeakMap();
const _propertyContext = new WeakMap();
const _store = new WeakMap();
const _isValidated = new WeakMap();
const _brokenRules = new WeakMap();
const _dataContext = new WeakMap();
const _dao = new WeakMap();

//endregion

//region Helper methods

//region Transfer object methods

function getTransferContext () {
  const properties = _properties.get( this );
  return new DataTransferContext(
    properties.toArray(),
    getPropertyValue.bind( this ),
    setPropertyValue.bind( this )
  );
}

function baseToDto() {
  const dto = {};
  const properties = _properties.get( this );
  properties.filter( property => {
    return property.isOnDto;
  } ).forEach( property => {
    dto[ property.name ] = getPropertyValue.call( this, property );
  } );
  return dto;
}

function toDto () {
  const extensions = _extensions.get( this );
  if (extensions.toDto)
    return extensions.toDto.call( this, getTransferContext.call( this ) );
  else
    return baseToDto.call( this );
}

function baseFromDto(dto) {
  const properties = _properties.get( this );
  properties.filter( property => {
    return property.isOnDto;
  } ).forEach( property => {
    if (dto.hasOwnProperty( property.name ) && typeof dto[ property.name ] !== 'function') {
      setPropertyValue.call( this, property, dto[ property.name ] );
    }
  } );
}

function fromDto (dto) {
  const extensions = _extensions.get( this );
  if (extensions.fromDto)
    extensions.fromDto.call( this, getTransferContext.call( this ), dto );
  else
    baseFromDto.call( this, dto );
}

//endregion

//region Permissions

function getAuthorizationContext(action, targetName) {
  return new AuthorizationContext( action, targetName || '', _brokenRules.get( this ) );
}

function canBeRead (property) {
  const rules = _rules.get( this );
  return rules.hasPermission(
    getAuthorizationContext.call( this, AuthorizationAction.readProperty, property.name )
  );
}

function canBeWritten (property) {
  const rules = _rules.get( this );
  return rules.hasPermission(
    getAuthorizationContext.call( this, AuthorizationAction.writeProperty, property.name )
  );
}

function canDo (action) {
  const rules = _rules.get( this );
  return rules.hasPermission(
    getAuthorizationContext.call( this, action )
  );
}

function canExecute (methodName) {
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

function getChildBrokenRules (namespace, bro) {
  const properties = _properties.get( this );
  properties.children().forEach( property => {
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

function getPropertyValue(property) {
  const store = _store.get( this );
  return store.getValue( property );
}

function setPropertyValue(property, value) {
  const store = _store.get( this );
  store.setValue( property, value );
  _store.set( this, store );
}

function readPropertyValue(property) {
  if (canBeRead.call( this, property )) {
    const store = _store.get( this );
    return property.getter ?
      property.getter( getPropertyContext.call( this, property ) ) :
      store.getValue( property );
  }
  else
    return null;
}

function writePropertyValue(property, value) {
  if (canBeWritten.call( this, property )) {
    if (property.setter)
      property.setter( getPropertyContext.call( this, property ), value );
    else {
      const store = _store.get( this );
      store.setValue( property, value );
      _store.set( this, store );
    }
  }
}

function getPropertyContext(primaryProperty) {
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

//endregion

//region Data portal methods

//region Helper

// function getDataContext( connection ) {
//   let dataContext = _dataContext.get( this );
//   if (!dataContext) {
//     const properties = _properties.get( this );
//     dataContext = new DataPortalContext(
//       _dao.get( this ),
//       properties.toArray(),
//       getPropertyValue.bind( this ),
//       setPropertyValue.bind( this )
//     );
//     _dataContext.set( this, dataContext );
//   }
//   return dataContext.setState( connection, false );
// }

function raiseEvent( event, methodName, error ) {
  this.emit(
    WebPortalEvent.getName( event ),
    new WebPortalEventArgs( event, this.$modelName, null, methodName, error )
  );
}

function wrapError( error ) {
  return new WebPortalError( MODEL_DESC, this.$modelName, WebPortalAction.execute, error );
}

//endregion

//region Execute

function data_execute( method, isTransaction ) {
  return new Promise( (fulfill, reject) => {
    const self = this;
    // Check permissions.
    if (method === M_EXECUTE ?
        canDo.call( self, AuthorizationAction.executeCommand ) :
        canExecute.call( self, method )) {

      // Launch start event.
      /**
       * The event arises before the command object will be executed in the repository.
       * @event CommandObject#preExecute
       * @param {bo.webAccess.WebPortalEventArgs} eventArgs - Data portal event arguments.
       * @param {CommandObject} oldObject - The instance of the model before the data portal action.
       */
      raiseEvent.call( self, WebPortalEvent.preExecute, method );
      // Execute command.
      WebPortal.call( self.$modelUri, 'execute', method, /* dto = */ toDto.call( self ) )
        .then( dto => {
          // Load property values.
          fromDto.call( self, dto );
          return dto;
        })
        .then( dto => {
          // Fetch children as well.
          return fetchChildren.call( self, dto );
        })
        .then( none => {
          // Launch finish event.
          /**
           * The event arises after the command object has been executed in the repository.
           * @event CommandObject#postExecute
           * @param {bo.webAccess.WebPortalEventArgs} eventArgs - Data portal event arguments.
           * @param {CommandObject} newObject - The instance of the model after the data portal action.
           */
          raiseEvent.call( self, WebPortalEvent.postExecute, method );
          // Returns the executed command object.
          fulfill( self );
        })
        .catch( reason => {
          // Wrap the intercepted error.
          const dpe = wrapError.call( self, reason );
          // Launch finish event.
          raiseEvent.call( self, WebPortalEvent.postExecute, method, dpe );
          // Pass the error.
          reject( dpe );
        });

      // let connection = null;
      // const extensions = _extensions.get( self );
      // (isTransaction ?
      //   config.connectionManager.beginTransaction( extensions.dataSource ) :
      //   config.connectionManager.openConnection( extensions.dataSource ))
      //   .then( dsc => {
      //     connection = dsc;
      //     // Launch start event.
      //     /**
      //      * The event arises before the command object will be executed in the repository.
      //      * @event CommandObject#preExecute
      //      * @param {bo.common.DataPortalEventArgs} eventArgs - Data portal event arguments.
      //      * @param {CommandObject} oldObject - The instance of the model before the data portal action.
      //      */
      //     raiseEvent.call( self, DataPortalEvent.preExecute, method );
      //     // Execute command.
      //     const dao = _dao.get( self );
      //     return extensions.dataExecute ?
      //       // *** Custom execute.
      //       extensions.$runMethod( 'execute', self, getDataContext.call( self, connection ), method ) :
      //       // *** Standard execute.
      //       dao.$runMethod( method, connection, /* dto = */ toDto.call( self ))
      //         .then( dto => {
      //           // Load property values.
      //           fromDto.call( self, dto );
      //           return dto;
      //         });
      //   })
      //   .then( dto => {
      //     // Fetch children as well.
      //     return fetchChildren.call( self, dto );
      //   })
      //   .then( none => {
      //     // Launch finish event.
      //     /**
      //      * The event arises after the command object has been executed in the repository.
      //      * @event CommandObject#postExecute
      //      * @param {bo.common.DataPortalEventArgs} eventArgs - Data portal event arguments.
      //      * @param {CommandObject} newObject - The instance of the model after the data portal action.
      //      */
      //     raiseEvent.call( self, DataPortalEvent.postExecute, method );
      //     // Close connection/Finish transaction.
      //     (isTransaction ?
      //       config.connectionManager.commitTransaction( extensions.dataSource, connection ) :
      //       config.connectionManager.closeConnection( extensions.dataSource, connection ))
      //       .then( none => {
      //         // Returns the executed command object.
      //         fulfill( self );
      //       });
      //   })
      //   .catch( reason => {
      //     // Wrap the intercepted error.
      //     const dpe = wrapError.call( self, reason );
      //     // Launch finish event.
      //     if (connection)
      //       raiseEvent.call( self, DataPortalEvent.postExecute, method, dpe );
      //     // Close connection/Undo transaction.
      //     (isTransaction ?
      //       config.connectionManager.rollbackTransaction( extensions.dataSource, connection ) :
      //       config.connectionManager.closeConnection( extensions.dataSource, connection ))
      //       .then( none => {
      //         // Pass the error.
      //         reject( dpe );
      //       });
      //   });
    }
  });
}

//endregion

//endregion

/**
 * Represents the definition of a command object model.
 *
 * @name CommandObject
 * @extends ModelBase
 *
 * @fires CommandObject#preExecute
 * @fires CommandObject#postExecute
 */
class CommandObject extends ModelBase {

  //region Constructor

  /**
   * Creates a new command object model instance.
   *
   * _The name of the model type available as:
   * __&lt;instance&gt;.constructor.modelType__, returns 'CommandObject'._
   *
   * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The event handlers must be an EventHandlerList object or null.
   */
  constructor(name, properties, rules, extensions, eventHandlers) {
    super();

    eventHandlers = Argument.inConstructor(name)
      .check(eventHandlers).forOptional('eventHandlers').asType(EventHandlerList);

    _properties.set( this, properties );
    // _rules.set( this, rules );
    _extensions.set( this, extensions );
    _eventHandlers.set( this, eventHandlers );
    // _store.set( this, store );
    _propertyContext.set( this, null );
    _isValidated.set( this, false );
    _brokenRules.set( this, new BrokenRuleList( name ) );
    _dataContext.set( this, null );

    // Get data access object.
    _dao.set( this, extensions.getDataAccessObject( name ) );

    // Set up business rules.
    rules.initialize(config.noAccessBehavior);

    // Set up event handlers.
    if (eventHandlers)
      eventHandlers.setup(this);

    /**
     * The name of the model. However, it can be hidden by a model property with the same name.
     *
     * @member CommandObject#$modelName
     * @type {string}
     * @readonly
     */
    this.$modelName = name;

    const store = new DataStore();

    //region Create properties

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

      // Create normal property.
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

    // Add other execute methods to the instance.
    extensions.buildOtherMethods( this, false );

    //endregion

    _store.set( this, store );
    _rules.set( this, rules );

    // Immutable definition object.
    Object.freeze( this );
  }

  //endregion

  //region Properties

  /**
   * The name of the model type.
   *
   * @member {string} CommandObject.modelType
   * @default CommandObject
   * @readonly
   */
  static get modelType() {
    return ModelType.CommandObject;
  }

  //endregion

  //region Actions

  /**
   * Executes the business object's statements in the repository.
   * <br/>_If method is not an empty string, &lt;instance&gt;.execute(method)
   * can be called as &lt;instance&gt;.method() as well._
   *
   * @function CommandObject#execute
   * @param {string} [method] - An alternative execute method of the data access object.
   * @param {boolean} [isTransaction] - Indicates whether transaction is required.
   * @returns {Promise.<CommandObject>} Returns a promise to the command object with the result.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The method must be a string or null.
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The transaction indicator must be a Boolean value or null.
   * @throws {@link bo.system.ArgumentError Argument error}:
   *      The callback must be a function.
   * @throws {@link bo.rules.AuthorizationError Authorization error}:
   *      The user has no permission to execute the action.
   */
  execute( method, isTransaction ) {
    const check = Argument.inMethod( this.$modelName, 'execute' );

    if (typeof method === 'boolean' || method instanceof Boolean) {
      isTransaction = method;
      method = M_EXECUTE;
    }

    method = check( method ).forOptional( 'method' ).asString();
    isTransaction = check( isTransaction ).forOptional( 'isTransaction' ).asBoolean();

    return data_execute.call( this, method || M_EXECUTE, isTransaction);
  }

  //endregion

  //region Validation

  /**
   * Indicates whether all the validation rules of the command object, including
   * the ones of its child objects, succeeds. A valid command object may have
   * broken rules with severity of success, information and warning.
   *
   * @function CommandObject#isValid
   * @returns {boolean} True when the command object is valid, otherwise false.
   */
  isValid() {
    if (!_isValidated.get( this ))
      this.checkRules();

    const brokenRules = _brokenRules.get( this );
    return brokenRules.isValid() && childrenAreValid.call( this );
  }

  /**
   * Executes all the validation rules of the command object, including the ones
   * of its child objects.
   *
   * @function CommandObject#checkRules
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
   * Gets the broken rules of the command object.
   *
   * @function CommandObject#getBrokenRules
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesOutput} The broken rules of the business object.
   */
  getBrokenRules(namespace) {
    const brokenRules = _brokenRules.get( this );
    let bro = brokenRules.output( namespace );
    bro = getChildBrokenRules.call( this, namespace, bro );
    return bro.$length ? bro : null;
  }

  /**
   * Gets the response to send to the client in case of broken rules.
   *
   * @function CommandObject#getResponse
   * @param {string} [message] - Human-readable description of the reason of the failure.
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesResponse} The broken rules response to send to the client.
   */
  getResponse(message, namespace) {
    const output = this.getBrokenRules( namespace );
    return output ? new BrokenRulesResponse( output, message ) : null;
  }

  //endregion
}

/**
 * Factory method to create definitions of command object models.
 *
 * @name bo.CommandObject
 */
class CommandObjectFactory {

  //region Constructor

  /**
   * Creates a definition for a command object model.
   *
   *    Valid child model types are:
   *
   *      * ReadOnlyChildObject
   *      * ReadOnlyChildCollection
   *
   * @param {string} name - The name of the command.
   * @param {bo.common.PropertyManager} properties - The property definitions.
   * @param {bo.common.RuleManager} rules - The validation and authorization rules.
   * @param {bo.common.ExtensionManager} extensions - The customization of the model.
   * @returns {CommandObject} The constructor of an asynchronous command object model.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The command name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The properties must be a PropertyManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The rules must be a RuleManager object.
   * @throws {@link bo.system.ArgumentError Argument error}: The extensions must be a ExtensionManager object.
   *
   * @throws {@link bo.common.ModelError Model error}:
   *    The child objects must be ReadOnlyChildObject or ReadOnlyChildCollection instances.
   */
  constructor(name, properties, rules, extensions) {
    const check = Argument.inConstructor(ModelType.CommandObject);

    name = check(name).forMandatory('name').asString();
    properties = check(properties).forMandatory('properties').asType(PropertyManager);
    rules = check(rules).forMandatory('rules').asType(RuleManager);
    extensions = check(extensions).forMandatory('extensions').asType(ExtensionManager);

    // Verify the model types of child objects.
    properties.modelName = name;
    properties.verifyChildTypes([
      ModelType.ReadOnlyChildObject,
      ModelType.ReadOnlyChildCollection
    ]);

    // Create model definition.
    const Model = CommandObject.bind( undefined, name, properties, rules, extensions );

    //region Factory methods

    /**
     * The name of the model type.
     *
     * @member {string} CommandObject.modelType
     * @default CommandObject
     * @readonly
     */
    Model.modelType = ModelType.CommandObject;

    /**
     * Creates a new command object instance.
     *
     * @function CommandObject.create
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {CommandObject} Returns a new command object.
     *
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The event handlers must be an EventHandlerList object or null.
     * @throws {@link bo.system.ArgumentError Argument error}:
     *      The callback must be a function.
     */
    Model.create = function( eventHandlers ) {
      return new Model( eventHandlers );
    };

    //endregion

    // Immutable definition class.
    Object.freeze( Model );
    return Model;
  }

  //endregion
}
// Immutable factory class.
Object.freeze( CommandObjectFactory );

export default CommandObjectFactory;
