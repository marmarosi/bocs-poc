'use strict';

import i18n from '../locales/i18n-bo.js';
const t = i18n( 'AuthorizationError' );

/**
 * Represents an authorization error.
 *
 * @memberof bo.rules
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class AuthorizationError extends Error {

  /**
   * Creates an authorization error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.rules.AuthorizationError#name
     * @default DaoError
     */
    this.name = this.constructor.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.rules.AuthorizationError#message
     */
    this.message = t( ...arguments );
  }
}

export default AuthorizationError;
