'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import ApiClientAction from './api-client-action.js';
import i18n from '../system/i18n-bo.js';

const t = i18n( 'ApiClientError' );

//endregion

/**
 * Represents an API portal error error.
 *
 * @memberof bo.apiAccess
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class ApiClientError extends Error {

  /**
   * Creates an API portal error object.
   *
   * @param {string} modeltype - The type of the model the error occurred in.
   * @param {string} modelName - The name of the model the error occurred in.
   * @param {bo.apiAccess.ApiClientAction} action - The API client action the error occurred in.
   * @param {error} interceptedError - The error to wrap.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The model type must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a ApiClientAction object.
   */
  constructor( modeltype, modelName, action, interceptedError ) {
    super();
    const check = Argument.inConstructor( ApiClientError.name );

    /**
     * The name of the error type.
     * @member {string} bo.apiAccess.ApiClientError#name
     * @default ApiClientError
     */
    this.name = ApiClientError.name;

    /**
     * The type of the model the intercepted error occurred in.
     * @member {string} bo.apiAccess.ApiClientError#modelType
     */
    this.modelType = check( modeltype ).forMandatory( 'modeltype' ).asString();

    /**
     * The name of the model the intercepted error occurred in.
     * @member {string} bo.apiAccess.ApiClientError#modelName
     */
    this.modelName = check( modelName ).forMandatory( 'modelName' ).asString();

    /**
     * The name of the action executing that the intercepted error occurred in.
     * @member {string} bo.apiAccess.ApiClientError#action
     */
    this.action = ApiClientAction.getName(
      check( action ).for( 'action' ).asEnumMember( ApiClientAction, null )
    );

    /**
     * The intercepted error of the API client action.
     * @member {error} bo.apiAccess.ApiClientError#innerError
     */
    this.innerError = interceptedError;

    /**
     * Human-readable description of the error.
     * @member {string} bo.apiAccess.ApiClientError#message
     */
    this.message = t.call( this, this.action, modelName );
  }
}

export default ApiClientError;
