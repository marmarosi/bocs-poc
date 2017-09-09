'use strict';

//region Imports

import config from '../system/configuration.js';
import Argument from '../system/argument-check.js';
import ApiClientAction from './api-client-action.js';
import ApiClientEvent from './api-client-event.js';
import ApiClientError from './api-client-error.js';

//endregion

//region Helper methods

function eventToAction( event ) {
  switch (event) {
    case ApiClientEvent.preFetch:
    case ApiClientEvent.postFetch:
      return ApiClientAction.fetch;
    case ApiClientEvent.preCreate:
    case ApiClientEvent.postCreate:
      return ApiClientAction.create;
    case ApiClientEvent.preInsert:
    case ApiClientEvent.postInsert:
      return ApiClientAction.insert;
    case ApiClientEvent.preUpdate:
    case ApiClientEvent.postUpdate:
      return ApiClientAction.update;
    case ApiClientEvent.preRemove:
    case ApiClientEvent.postRemove:
      return ApiClientAction.remove;
    case ApiClientEvent.preExecute:
    case ApiClientEvent.postExecute:
      return ApiClientAction.execute;
    case ApiClientEvent.preSave:
    case ApiClientEvent.postSave:
    default:
      return null;
  }
}

//endregion

/**
 * Provides the context for API client events.
 *
 * @memberof bo.apiAccess
 */
class ApiClientEventArgs {

  /**
   * Creates new API client event arguments.
   *   </br></br>
   * <i><b>Warning:</b> API client event arguments are created in models internally.
   * They are intended only to make publicly available the context for API client events.</i>
   *
   * @param {bo.apiAccess.ApiClientEvent} event - The API client event.
   * @param {string} modelName - The name of the business object model.
   * @param {bo.apiAccess.ApiClientAction} [action] - The type of the API client operation.
   * @param {string} [methodName] - The name of the API client object method called.
   * @param {bo.apiAccess.ApiClientError} [error] - The eventual error occurred in API client action.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The event must be a ApiClientEvent item.
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a ApiClientAction item.
   * @throws {@link bo.system.ArgumentError Argument error}: The method name must be a string value.
   * @throws {@link bo.system.ArgumentError Argument error}: The error must be a ApiClientError object.
   */
  constructor( event, modelName, action, methodName, error ) {

    const check = Argument.inConstructor( ApiClientEventArgs.name );

    event = check( event ).for( 'event' ).asEnumMember( ApiClientEvent, null );

    /**
     * The name of the API client event.
     * @member {string} bo.apiAccess.ApiClientEventArgs#eventName
     * @readonly
     */
    this.eventName = ApiClientEvent.getName( event );
    /**
     * The name of the business object model.
     * @member {string} bo.apiAccess.ApiClientEventArgs#modelName
     * @readonly
     */
    this.modelName = check( modelName ).forMandatory( 'modelName' ).asString();
    /**
     * The type of the API client operation.
     * @member {bo.apiAccess.ApiClientAction} bo.apiAccess.ApiClientEventArgs#action
     * @readonly
     */
    this.action = check( action ).for( 'action' ).asEnumMember( ApiClientAction, eventToAction( event ) );
    /**
     * The name of the API client object method called.
     * @member {string} bo.apiAccess.ApiClientEventArgs#methodName
     * @readonly
     */
    this.methodName = methodName || ApiClientAction.getName( this.action );
    /**
     * The error occurred in API client action, otherwise null.
     * @member {bo.apiAccess.ApiClientError} bo.apiAccess.ApiClientEventArgs#error
     * @readonly
     */
    this.error = check( error ).forOptional( 'error' ).asType( ApiClientError );

    /**
     * The current user.
     * @member {bo.system.UserInfo} bo.apiAccess.ApiClientEventArgs#user
     * @readonly
     */
    this.user = config.getUser();
    /**
     * The current locale.
     * @member {string} bo.apiAccess.ApiClientEventArgs#locale
     * @readonly
     */
    this.locale = config.getLocale();

    // Immutable object.
    Object.freeze( this );
  }
}

export default ApiClientEventArgs;
