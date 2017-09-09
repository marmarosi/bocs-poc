'use strict';

//region Imports

const fs = require( 'fs' );
const path = require( 'path' );
const FactoryBase = require( './data/factory-base.js' );

//endregion

//region Helper methods

function decideMethodName( base, model, name ) {
  let methodName;
  if (base[ name ])
    methodName = name;
  else {
    const mapped = model.$methodMap[ name ];
    if (mapped)
      methodName = mapped;
  }
  if (!methodName)
    throw new Error( 'Invalid method: ' + name );

  return methodName;
}

//endregion

class ApiPortal {

  constructor( apiUrl, modelsPath ) {

    apiUrl = apiUrl || '/';
    this.apiUrl = apiUrl.endsWith( '/' ) ? apiUrl : apiUrl + '/';

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
        this.initialize( rootPath, relPath + item + '/' );

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

  //region Request processing

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

      // Get the requested model.
      let model = null;
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
          if (model.$isCommand) {
            //region Execute (instance) methods

            const instance = model.create();
            instance.fromCto( req.body )
              .then( command => {

                let methodName = decideMethodName( command, model, method );

                command[ methodName ]()
                  .then( result => {
                    resolve( result.toCto() );
                  } );
              } )
              .catch( reason => {
                reject( reason );
              } );

            //endregion
          }
          else {
            //region Fetch (factory) methods

            let methodName = decideMethodName( model, model, method );

            const filter = req.body.$isEmpty ?
              null : (
                req.body.hasOwnProperty( '$filter' ) ?
                  req.body.$filter :
                  req.body
              );

            model[ methodName ]( filter )
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
          }
          break;
      }
    } );
  }

  //endregion
}

module.exports = ApiPortal;
