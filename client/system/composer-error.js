'use strict';

import i18n from './i18n-bo.js';
const t = i18n( 'ComposerError' );

/**
 * Represents an improper use of model composer.
 *
 * @memberof bo.system
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class ComposerError extends Error {

  /**
   * Creates a composer error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    /**
     * The name of the error type.
     * @member {string} bo.system.ComposerError#name
     * @default ComposerError
     */
    this.name = ComposerError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.system.ComposerError#message
     */
    this.message = t( ...arguments );

    /**
     * The name of the model that contains the definition error.
     * @member {string} bo.system.ComposerError#model
     */
    this.modelName = '';

    /**
     * The name of the model type of the model that contains the definition error.
     * @member {string} bo.system.ComposerError#modelType
     */
    this.modelType = '';

    /**
     * The name of the method of the model composer that found the definition error.
     * @member {string} bo.system.ComposerError#method
     */
    this.methodName = '';
  }
}

export default ComposerError;
