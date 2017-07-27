'use strict';

const BookList = require( './models/book-list.js' );

class BoProxy {
  constructor( baseUrl ) {

    baseUrl = baseUrl || '/';
    this.baseUrl = baseUrl[ baseUrl.length - 1 ] === '/' ? baseUrl : baseUrl + '/';
  }

  process( req, res ) {
    return new Promise( ( resolve, reject ) => {

      if (!req.url.startsWith( this.baseUrl )) {
        reject( 'Invalid API URL.' );
        return;
      }

      const url = req.url.substr( this.baseUrl.length );
      const pos = url.lastIndexOf( '/' );
      if (pos < 1) {
        reject( 'Invalid API URL.' );
        return;
      }

      let type = url.substr( 0, pos );
      let method = url.substr( pos + 1 );
      let model = null;

      switch (type) {
        case 'BookList':
          model = BookList;
          break;
        default:
          reject( 'Invalid type: ' + type );
          return;
      }
      if (model[ method ])
        model[ method ]()
          .then( result => {
            resolve( result.toCto() );
          } )
          .catch( reason => {
            reject( reason );
          } );
      else
        reject( 'Invalid method: ' + method );
    } );
  }
}

module.exports = BoProxy;
