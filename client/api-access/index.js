'use strict';

//region Imports

import ApiClient from './api-client.js';
import ApiClientBase from './api-client-base.js';
import ApiClientAction from './api-client-action.js';
import ApiClientEvent from './api-client-event.js';
import ApiClientEventArgs from './api-client-event-args.js';
import ApiClientError from './api-client-error.js';
import EventHandlerList from './event-handler-list.js';

//endregion

/**
 * Contains components used in API portal access.
 *
 * @namespace bo.apiAccess
 *
 * @property {function} ApiClientContext - {@link bo.apiAccess.ApiClient API client}
 *      constructor to create new default API client implementation.
 * @property {function} ApiClientContext - {@link bo.apiAccess.ApiClientBase API client base}
 *      serves as the base class for API client implementations.
 * @property {function} ApiClientAction - {@link bo.apiAccess.ApiClientAction API client action}
 *      enumeration specifies the model operations to execute on API access objects.
 * @property {function} ApiClientEvent - {@link bo.apiAccess.ApiClientEvent API client event}
 *      enumeration specifies the events of API client operations.
 * @property {function} ApiClientEventArgs - {@link bo.apiAccess.ApiClientEventArgs API client event arguments}
 *      constructor to create new context object for API client events.
 * @property {function} ApiClientError - {@link bo.apiAccess.ApiClientError API client error}
 *      constructor to create a new error related to API client actions.
 * @property {function} EventHandlerList - {@link bo.apiAccess.EventHandlerList Event handler list}
 *      constructor to create a new event handler collection.
 */
const index = {
  ApiClient: ApiClient,
  ApiClientBase: ApiClientBase,
  ApiClientAction: ApiClientAction,
  ApiClientEvent: ApiClientEvent,
  ApiClientEventArgs: ApiClientEventArgs,
  ApiClientError: ApiClientError,
  EventHandlerList: EventHandlerList
};

// Immutable object.
Object.freeze( index );

export default index;
