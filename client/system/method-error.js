'use strict';

import i18n from './i18n-bo.js';
const t = i18n( 'MethodError' );

/**
 * Represents a method argument error.
 *
 * @memberof bo.system
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class MethodError extends Error {

  /**
   * Creates a method argument error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.system.MethodError#name
     * @default ArgumentError
     */
    this.name = MethodError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.system.MethodError#message
     */
    this.message = t( ...arguments );
  }
}

export default MethodError;
