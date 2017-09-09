"use strict";

import ApiClientBase from './api-client-base.js';

class ApiClient extends ApiClientBase {

  constructor( config ) {
    super();

    let apiRootUrl = config.apiRootUrl || '/api/';
    if (!apiRootUrl.endsWith( '/' ))
      apiRootUrl += '/';

    this.apiRootUrl = apiRootUrl;
  }

  call( modelUri, apiMethod, altName, data ) {

    const url = this.apiRootUrl + modelUri + '/' + (altName || apiMethod);

    const body = JSON.stringify(
      data === undefined || data === null ?
        { $isEmpty: true } : (
          typeof data === 'object' ?
            data :
            { $filter: data }
        ) );

    const headers = new Headers({
      "Content-Type": "application/json",
      "Content-Length": body.length
    });

    const init = {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: body
    };

    return fetch( url, init )
      .then( response => {
        if (response.ok) {
          const contentType = response.headers.get( "content-type" );

          if (contentType === null)
            return null; // In case of remove.

          if (contentType && contentType.includes( "application/json" ))
            return response.json();

          throw new TypeError("Oops, we haven't got JSON!");
        }
        throw new Error('Network response was not O.K.');
      });
  }
}

export default ApiClient;
