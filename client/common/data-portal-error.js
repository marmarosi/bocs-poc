'use strict';

import Argument from '../system/argument-check.js';
import DataPortalAction from './data-portal-action.js';
const t = require( '../locales/i18n-bo.js' )( 'DataPortalError' );

/**
 * Represents a data portal error error.
 *
 * @memberof bo.common
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class DataPortalError extends Error {

  /**
   * Creates a data portal error object.
   *
   * @param {string} modeltype - The type of the model the error occurred in.
   * @param {string} modelName - The name of the model the error occurred in.
   * @param {bo.common.DataPortalAction} action - The data portal action the error occurred in.
   * @param {error} interceptedError - The error to be wrapped.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The model type must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a DataPortalAction object.
   */
  constructor( modeltype, modelName, action, interceptedError ) {
    super();
    const check = Argument.inConstructor( DataPortalError.name );

    /**
     * The name of the error type.
     * @member {string} bo.common.DataPortalError#name
     * @default DataPortalError
     */
    this.name = DataPortalError.name;

    /**
     * The type of the model the intercepted error occurred in.
     * @member {string} bo.common.DataPortalError#modelType
     */
    this.modelType = check( modeltype ).forMandatory( 'modeltype' ).asString();

    /**
     * The name of the model the intercepted error occurred in.
     * @member {string} bo.common.DataPortalError#modelName
     */
    this.modelName = check( modelName ).forMandatory( 'modelName' ).asString();

    /**
     * The name of the action executing that the intercepted error occurred in.
     * @member {string} bo.common.DataPortalError#action
     */
    this.action = DataPortalAction.getName(
      check( action ).for( 'action' ).asEnumMember( DataPortalAction, null )
    );

    /**
     * The intercepted error of the data portal action.
     * @member {error} bo.common.DataPortalError#innerError
     */
    this.innerError = interceptedError;

    /**
     * Human-readable description of the error.
     * @member {string} bo.common.DataPortalError#message
     */
    this.message = t.call( this, this.action, modelName );
  }
}

export default DataPortalError;
