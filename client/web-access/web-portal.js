"use strict";

import modelType from '../common/model-type.js';

class WebPortal {

  static call( modelUri, dpMethod, altName, data ) {

    const url = '/api/' + modelUri + '/' + (altName || dpMethod);

    let body = { $isEmpty: true };
    if (data !== undefined && data !== null) {
      if (typeof data === 'object')
        body = data;
      else if (dpMethod === 'remove')
        body = { key: data };
      else
        body = { $filter: data };
    }
    body = JSON.stringify( body );

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

export default WebPortal;
