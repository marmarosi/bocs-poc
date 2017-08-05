'use strict';

//region Imports

import config from '../system/configuration.js';
import Argument from '../system/argument-check.js';
import WebPortalAction from './web-portal-action.js';
import WebPortalEvent from './web-portal-event.js';
import WebPortalError from './web-portal-error.js';

//endregion

//region Helper methods

function eventToAction( event ) {
  switch (event) {
    case WebPortalEvent.preFetch:
    case WebPortalEvent.postFetch:
      return WebPortalAction.fetch;
    case WebPortalEvent.preCreate:
    case WebPortalEvent.postCreate:
      return WebPortalAction.create;
    case WebPortalEvent.preInsert:
    case WebPortalEvent.postInsert:
      return WebPortalAction.insert;
    case WebPortalEvent.preUpdate:
    case WebPortalEvent.postUpdate:
      return WebPortalAction.update;
    case WebPortalEvent.preRemove:
    case WebPortalEvent.postRemove:
      return WebPortalAction.remove;
    case WebPortalEvent.preExecute:
    case WebPortalEvent.postExecute:
      return WebPortalAction.execute;
    case WebPortalEvent.preSave:
    case WebPortalEvent.postSave:
    default:
      return null;
  }
}

//endregion

/**
 * Provides the context for data portal events.
 *
 * @memberof bo.webAccess
 */
class WebPortalEventArgs {

  /**
   * Creates new data portal event arguments.
   *   </br></br>
   * <i><b>Warning:</b> Data portal event arguments are created in models internally.
   * They are intended only to make publicly available the context for data portal events.</i>
   *
   * @param {bo.webAccess.WebPortalEvent} event - The data portal event.
   * @param {string} modelName - The name of the business object model.
   * @param {bo.webAccess.WebPortalAction} [action] - The type of the data portal operation.
   * @param {string} [methodName] - The name of the data access object method called.
   * @param {bo.webAccess.WebPortalError} [error] - The eventual error occurred in data portal action.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The event must be a WebPortalEvent item.
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a WebPortalAction item.
   * @throws {@link bo.system.ArgumentError Argument error}: The method name must be a string value.
   * @throws {@link bo.system.ArgumentError Argument error}: The error must be a WebPortalError object.
   */
  constructor( event, modelName, action, methodName, error ) {

    const check = Argument.inConstructor( WebPortalEventArgs.name );

    event = check( event ).for( 'event' ).asEnumMember( WebPortalEvent, null );

    /**
     * The name of the data portal event.
     * @member {string} bo.webAccess.WebPortalEventArgs#eventName
     * @readonly
     */
    this.eventName = WebPortalEvent.getName( event );
    /**
     * The name of the business object model.
     * @member {string} bo.webAccess.WebPortalEventArgs#modelName
     * @readonly
     */
    this.modelName = check( modelName ).forMandatory( 'modelName' ).asString();
    /**
     * The type of the data portal operation.
     * @member {bo.webAccess.WebPortalAction} bo.webAccess.WebPortalEventArgs#action
     * @readonly
     */
    this.action = check( action ).for( 'action' ).asEnumMember( WebPortalAction, eventToAction( event ) );
    /**
     * The name of the data access object method called.
     * @member {string} bo.webAccess.WebPortalEventArgs#methodName
     * @readonly
     */
    this.methodName = methodName || WebPortalAction.getName( this.action );
    /**
     * The error occurred in data portal action, otherwise null.
     * @member {bo.webAccess.WebPortalError} bo.webAccess.WebPortalEventArgs#error
     * @readonly
     */
    this.error = check( error ).forOptional( 'error' ).asType( WebPortalError );

    /**
     * The current user.
     * @member {bo.system.UserInfo} bo.webAccess.WebPortalEventArgs#user
     * @readonly
     */
    this.user = config.getUser();
    /**
     * The current locale.
     * @member {string} bo.webAccess.WebPortalEventArgs#locale
     * @readonly
     */
    this.locale = config.getLocale();

    // Immutable object.
    Object.freeze( this );
  }
}

export default WebPortalEventArgs;
