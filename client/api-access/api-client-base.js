'use strict';

import NotImplementedError from'../system/not-implemented-error.js';

/**
 * Serves as the base class for models.
 *
 * @memberof bo.apiAccess
 */
class ApiClientBase {

  /**
   * Creates a base API client instance.
   */
  constructor() { }

  /**
   * Calls an API Portal method.
   *
   * @param {string} modelUri - The URI of the business object modell.
   * @param {string} apiMethod - The method name of the API Portal to call.
   * @param {string} [altName] - The optional alternative method name of the API Portal.
   * @param {*} [data] - Tha data to send to the API Portal.
   */
  call( modelUri, apiMethod, altName, data ) {
    throw new NotImplementedError( 'The call method of ApiClient class is not implemented.' );
  }
}

export default ApiClientBase;
