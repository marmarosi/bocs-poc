'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
//const modelType = require( './common/model-type.js' );
const FactoryBase = require( './data/factory-base.js' );

class BoProxy {
  constructor( apiUrl, modelsPath ) {

    apiUrl = apiUrl || '/';
    this.apiUrl = apiUrl[ apiUrl.length - 1 ] === '/' ? apiUrl : apiUrl + '/';

    this.models = {};
    this.initialize( path.join( __dirname, modelsPath ), '' );
  }

  //region Initialization

  initialize( rootPath, relPath ) {

    // Read factory models
    const dirPath = path.join( rootPath, relPath );
    const items = fs.readdirSync( dirPath );
    items.forEach( item => {

      const itemPath = path.join( dirPath, item );
      const stat = fs.statSync( itemPath );

      if (stat.isDirectory())
        this.readModels( rootPath, relPath + item + '/' );

      else if (stat.isFile() && path.extname( item ) === '.js') {
        const model = require( itemPath );
        if (model instanceof FactoryBase) {

          if (!model.$modelUri)
            throw new Error( 'Missing model URI: ' + itemPath );
          if (this.models[ model.$modelUri ])
            throw new Error( 'Duplicate model URI: ' + model.$modelUri );

          this.models[ model.$modelUri ] = model;
        }
      }
    } );
  }

  //endregion

  //region Process requests

  process( req, res ) {
    return new Promise( ( resolve, reject ) => {

      // Test if API request is...
      if (!req.url.startsWith( this.apiUrl ))
        return reject( 'Invalid API URL.' );

      const url = req.url.substr( this.apiUrl.length );
      const pos = url.lastIndexOf( '/' );
      if (pos < 1)
        return reject( new Error( 'Invalid API URL.' ) );

      // Read model type and method from URL.
      let type = url.substr( 0, pos );
      let method = url.substr( pos + 1 );
      let model = null;

      // Get the requested model.
      if (this.models[ type ])
        model = this.models[ type ];
      else
        return reject( new Error( 'Invalid type: ' + type ) );

      // Call the requested method and return the result.
      switch (method) {
        case 'insert':
          //region Insert method

          model.create()
            .then( instance => {
              instance.fromCto( req.body )
                .then( changed => {
                  changed.save()
                    .then( result => {
                      resolve( result.toCto() );
                    } );
                } );
            } )
            .catch( reason => {
              reject( reason );
            } );

          //endregion
          break;

        case 'update':
          //region Update method

          model[ req.body.method ]( req.body.filter )
            .then( instance => {
              instance.fromCto( req.body.dto )
                .then( changed => {
                  changed.save()
                    .then( result => {
                      resolve( result.toCto() );
                    } );
                } );
            } )
            .catch( reason => {
              reject( reason );
            } );

          //endregion
          break;

        case 'remove':
          //region Remove method

          model[ req.body.method ]( req.body.filter )
            .then( instance => {
              instance.remove();
              instance.save()
                .then( () => {
                  resolve( null );
                } );
            } )
            .catch( reason => {
              reject( reason );
            } );

          //endregion
          break;

        default:
          //region Factory methods

          let methodName;
          if (model[ method ])
            methodName = method;
          else {
            const mapped = model.$methodMap[ method ];
            if (mapped)
              methodName = mapped;
          }
          if (!methodName)
            reject( new Error( 'Invalid method: ' + method ) );

          const filter = req.body.$isEmpty ?
            null : (
              req.body.hasOwnProperty( '$filter' ) ?
                req.body.$filter :
                req.body
            );

          const pResult = filter ?
            model[ methodName ]( filter ) :
            model[ methodName ]()
          ;
          pResult
            .then( result => {

              const cto = result.constructor.name === 'ReadOnlyRootCollection' ?
                {
                  modelType: 'ReadOnlyRootCollection',
                  collection: result.toCto(),
                  totalItems: result.totalItems
                } :
                result.toCto();
              resolve( cto );
            } )
            .catch( reason => {
              reject( reason );
            } );

          //endregion
          break;
      }
    } );
  }

  //endregion
}

module.exports = BoProxy;
