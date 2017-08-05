"use strict";

class WebPortal {

  static call( modelUri, dpMethod, altName, data ) {

    const url = '/api/' + modelUri + '/' + (altName || dpMethod);

    const headers = new Headers({
      "Content-Type": "application/json",
      "Content-Length": JSON.stringify( data ).length.toString()
    });

    const init = {
      method: 'POST',
      headers: headers,
      credentials: 'include',
      body: data
    };

    return fetch( url, init )
      .then( response => {
        if (response.ok) {
          const contentType = response.headers.get( "content-type" );
          if (contentType && contentType.includes( "application/json" )) {
            return response.json();
          }
          throw new TypeError("Oops, we haven't got JSON!");
        }
        throw new Error('Network response was not O.K.');
      });
  }
}

export default WebPortal;
