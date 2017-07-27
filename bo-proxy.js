'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const FactoryBase = require( './data/factory-base.js' );

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
        if (model instanceof FactoryBase) {

          if (!model.modelUri)
            throw new Error( 'Missing model URI: ' + itemPath );
          if (this.models[ model.modelUri ])
            throw new Error( 'Duplicate model URI: ' + model.modelUri );

          this.models[ model.modelUri ] = model;
        }
      }
    });
  }

  process( req, res ) {
    return new Promise( ( resolve, reject ) => {

      if (!req.url.startsWith( this.apiUrl ))
        return reject( 'Invalid API URL.' );

      const url = req.url.substr( this.apiUrl.length );
      const pos = url.lastIndexOf( '/' );
      if (pos < 1)
        return reject( 'Invalid API URL.' );

      let type = url.substr( 0, pos );
      let method = url.substr( pos + 1 );
      let model = null;

      if (this.models[ type ])
        model = this.models[ type ];
      else
        return reject( 'Invalid type: ' + type );

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
