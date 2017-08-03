'use strict';

import i18n from '../locales/i18n-bo.js';
const t = i18n( 'ArgumentError' );

/**
 * Represents an argument error.
 *
 * @memberof bo.system
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class ArgumentError extends Error {

  /**
   * Creates an argument error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.system.ArgumentError#name
     * @default ArgumentError
     */
    this.name = ArgumentError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.system.ArgumentError#message
     */
    this.message = t( ...arguments );
  }
}

export default ArgumentError;
