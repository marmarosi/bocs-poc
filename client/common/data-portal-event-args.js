'use strict';

//region Imports

import config from '../system/configuration.js';
import Argument from '../system/argument-check.js';
import DataPortalAction from './data-portal-action.js';
import DataPortalEvent from './data-portal-event.js';
import DataPortalError from './data-portal-error.js';

//endregion

//region Helper methods

function eventToAction( event ) {
  switch (event) {
    case DataPortalEvent.preFetch:
    case DataPortalEvent.postFetch:
      return DataPortalAction.fetch;
    case DataPortalEvent.preCreate:
    case DataPortalEvent.postCreate:
      return DataPortalAction.create;
    case DataPortalEvent.preInsert:
    case DataPortalEvent.postInsert:
      return DataPortalAction.insert;
    case DataPortalEvent.preUpdate:
    case DataPortalEvent.postUpdate:
      return DataPortalAction.update;
    case DataPortalEvent.preRemove:
    case DataPortalEvent.postRemove:
      return DataPortalAction.remove;
    case DataPortalEvent.preExecute:
    case DataPortalEvent.postExecute:
      return DataPortalAction.execute;
    case DataPortalEvent.preSave:
    case DataPortalEvent.postSave:
    default:
      return null;
  }
}

//endregion

/**
 * Provides the context for data portal events.
 *
 * @memberof bo.common
 */
class DataPortalEventArgs {

  /**
   * Creates new data portal event arguments.
   *   </br></br>
   * <i><b>Warning:</b> Data portal event arguments are created in models internally.
   * They are intended only to make publicly available the context for data portal events.</i>
   *
   * @param {bo.common.DataPortalEvent} event - The data portal event.
   * @param {string} modelName - The name of the business object model.
   * @param {bo.common.DataPortalAction} [action] - The type of the data portal operation.
   * @param {string} [methodName] - The name of the data access object method called.
   * @param {bo.common.DataPortalError} [error] - The eventual error occurred in data portal action.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The event must be a DataPortalEvent item.
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a DataPortalAction item.
   * @throws {@link bo.system.ArgumentError Argument error}: The method name must be a string value.
   * @throws {@link bo.system.ArgumentError Argument error}: The error must be a DataPortalError object.
   */
  constructor( event, modelName, action, methodName, error ) {

    const check = Argument.inConstructor( DataPortalEventArgs.name );

    event = check( event ).for( 'event' ).asEnumMember( DataPortalEvent, null );

    /**
     * The name of the data portal event.
     * @member {string} bo.common.DataPortalEventArgs#eventName
     * @readonly
     */
    this.eventName = DataPortalEvent.getName( event );
    /**
     * The name of the business object model.
     * @member {string} bo.common.DataPortalEventArgs#modelName
     * @readonly
     */
    this.modelName = check( modelName ).forMandatory( 'modelName' ).asString();
    /**
     * The type of the data portal operation.
     * @member {bo.common.DataPortalAction} bo.common.DataPortalEventArgs#action
     * @readonly
     */
    this.action = check( action ).for( 'action' ).asEnumMember( DataPortalAction, eventToAction( event ) );
    /**
     * The name of the data access object method called.
     * @member {string} bo.common.DataPortalEventArgs#methodName
     * @readonly
     */
    this.methodName = methodName || DataPortalAction.getName( this.action );
    /**
     * The error occurred in data portal action, otherwise null.
     * @member {bo.common.DataPortalError} bo.common.DataPortalEventArgs#error
     * @readonly
     */
    this.error = check( error ).forOptional( 'error' ).asType( DataPortalError );

    /**
     * The current user.
     * @member {bo.system.UserInfo} bo.common.DataPortalEventArgs#user
     * @readonly
     */
    this.user = config.getUser();
    /**
     * The current locale.
     * @member {string} bo.common.DataPortalEventArgs#locale
     * @readonly
     */
    this.locale = config.getLocale();

    // Immutable object.
    Object.freeze( this );
  }
}

export default DataPortalEventArgs;
