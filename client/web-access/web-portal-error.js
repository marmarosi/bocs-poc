'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import WebPortalAction from './web-portal-action.js';
import i18n from '../system/i18n-bo.js';

const t = i18n( 'WebPortalError' );

//endregion

/**
 * Represents a data portal error error.
 *
 * @memberof bo.webAccess
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class WebPortalError extends Error {

  /**
   * Creates a data portal error object.
   *
   * @param {string} modeltype - The type of the model the error occurred in.
   * @param {string} modelName - The name of the model the error occurred in.
   * @param {bo.webAccess.WebPortalAction} action - The data portal action the error occurred in.
   * @param {error} interceptedError - The error to be wrapped.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The model type must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a WebPortalAction object.
   */
  constructor( modeltype, modelName, action, interceptedError ) {
    super();
    const check = Argument.inConstructor( WebPortalError.name );

    /**
     * The name of the error type.
     * @member {string} bo.webAccess.WebPortalError#name
     * @default WebPortalError
     */
    this.name = WebPortalError.name;

    /**
     * The type of the model the intercepted error occurred in.
     * @member {string} bo.webAccess.WebPortalError#modelType
     */
    this.modelType = check( modeltype ).forMandatory( 'modeltype' ).asString();

    /**
     * The name of the model the intercepted error occurred in.
     * @member {string} bo.webAccess.WebPortalError#modelName
     */
    this.modelName = check( modelName ).forMandatory( 'modelName' ).asString();

    /**
     * The name of the action executing that the intercepted error occurred in.
     * @member {string} bo.webAccess.WebPortalError#action
     */
    this.action = WebPortalAction.getName(
      check( action ).for( 'action' ).asEnumMember( WebPortalAction, null )
    );

    /**
     * The intercepted error of the data portal action.
     * @member {error} bo.webAccess.WebPortalError#innerError
     */
    this.innerError = interceptedError;

    /**
     * Human-readable description of the error.
     * @member {string} bo.webAccess.WebPortalError#message
     */
    this.message = t.call( this, this.action, modelName );
  }
}

export default WebPortalError;
