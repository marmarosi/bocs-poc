'use strict';

const t = require( '../locales/i18n-bo.js' )( 'EnumerationError' );

/**
 * Represents an enumeration error.
 *
 * @memberof bo.system
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class EnumerationError extends Error {

  /**
   * Creates an enumeration error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.system.EnumerationError#name
     * @default ArgumentError
     */
    this.name = EnumerationError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.system.EnumerationError#message
     */
    this.message = t( ...arguments );
  }
}

export default EnumerationError;
