'use strict';

import i18n from '../system/i18n-bo.js';
const t = i18n( 'ModelError' );

/**
 * Represents a model error.
 *
 * @memberof bo.common
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class ModelError extends Error {

  /**
   * Creates a model error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.common.ModelError#name
     * @default ModelError
     */
    this.name = ModelError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.common.ModelError#message
     */
    this.message = t( ...arguments );
  }
}

export default ModelError;
