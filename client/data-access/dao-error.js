'use strict';

import i18n from '../system/i18n-bo.js';
const t = i18n( 'DaoError' );

/**
 * Represents a data access error.
 *
 * @memberof bo.dataAccess
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class DaoError extends Error {

  /**
   * Creates a data access error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.dataAccess.DaoError#name
     * @default DaoError
     */
    this.name = DaoError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.dataAccess.DaoError#message
     */
    this.message = t( ...arguments );
  }
}

export default DaoError;
