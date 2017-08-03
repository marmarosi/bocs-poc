'use strict';

import i18n from '../locales/i18n-bo.js';
const t = i18n( 'PropertyError' );

/**
 * Represents a property argument error.
 *
 * @memberof bo.system
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class PropertyError extends Error {

  /**
   * Creates a property argument error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.system.PropertyError#name
     * @default ArgumentError
     */
    this.name = PropertyError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.system.PropertyError#message
     */
    this.message = t( ...arguments );
  }
}

export default PropertyError;
