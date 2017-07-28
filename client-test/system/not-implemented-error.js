'use strict';

const t = require( '../locales/i18n-bo.js' )( 'NotImplementedError' );

/**
 * Represents the error of a not implemented function.
 *
 * @memberof bo.system
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class NotImplementedError extends Error {

  /**
   * Creates a not implemented error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.system.NotImplementedError#name
     * @default ArgumentError
     */
    this.name = NotImplementedError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.system.NotImplementedError#message
     */
    this.message = t( ...arguments );
  }
}

export default NotImplementedError;
