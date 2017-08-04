'use strict';

import i18n from './i18n-bo.js';
const t = i18n( 'ConstructorError' );

/**
 * Represents a constructor argument error.
 *
 * @memberof bo.system
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class ConstructorError extends Error {

  /**
   * Creates a constructor argument error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.system.ConstructorError#name
     * @default ArgumentError
     */
    this.name = ConstructorError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.system.ConstructorError#message
     */
    this.message = t( ...arguments );
  }
}

export default ConstructorError;
