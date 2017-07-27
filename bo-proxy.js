'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const BookList = require( './data/models/book-list.js' );
const AdminBookList = require( './data/models/admin/book-list.js' );

class BoProxy {
  constructor( apiUrl, modelsPath ) {

    apiUrl = apiUrl || '/';
    this.apiUrl = apiUrl[ apiUrl.length - 1 ] === '/' ? apiUrl : apiUrl + '/';

    this.models = { };
    this.readModels( path.join( __dirname, modelsPath ), '' );
  }

  readModels( rootPath, relPath ) {

    const dirPath = path.join( rootPath, relPath );
    const items = fs.readdirSync( dirPath );
    items.forEach( item => {

      const itemPath = path.join( dirPath, item );
      const stat = fs.statSync( itemPath );

      if (stat.isDirectory())
        this.readModels( rootPath, relPath + item + '/' );

      else if (stat.isFile() && path.extname( item ) === '.js' ) {
        const model = require( itemPath );
        if (model.modelType)
          this.models[ relPath + path.basename( item, '.js' ) ] = require( itemPath );
      }
    });
  }

  process( req, res ) {
    return new Promise( ( resolve, reject ) => {

      if (!req.url.startsWith( this.apiUrl )) {
        reject( 'Invalid API URL.' );
        return;
      }

      const url = req.url.substr( this.apiUrl.length );
      const pos = url.lastIndexOf( '/' );
      if (pos < 1) {
        reject( 'Invalid API URL.' );
        return;
      }

      let type = url.substr( 0, pos );
      let method = url.substr( pos + 1 );
      let model = null;

      if (this.models[ type ])
        model = this.models[ type ];
      else {
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
