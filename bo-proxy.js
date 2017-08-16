'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
//const modelType = require( './common/model-type.js' );
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

          if (!model.$modelUri)
            throw new Error( 'Missing model URI: ' + itemPath );
          if (this.models[ model.$modelUri ])
            throw new Error( 'Duplicate model URI: ' + model.modelUri );

          this.models[ model.$modelUri ] = model;
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
        return reject( new Error( 'Invalid API URL.' ) );

      let type = url.substr( 0, pos );
      let method = url.substr( pos + 1 );
      let model = null;

      if (this.models[ type ])
        model = this.models[ type ];
      else
        return reject( new Error( 'Invalid type: ' + type ) );

      switch (method){
        case 'insert':
          const key = 0;
          model.create( key )
            .then( instance => {
              instance.fromCto( req.body )
                .then( changed => {
                  resolve( changed.save() );
                } );
            } )
            .catch( reason => {
              reject( reason );
            } );
          break;

        case 'update':
        case 'remove':
          model.fetch()
            .then( instance => {
              instance.fromCto( req.body )
                .then( changed => {
                  resolve( changed.save() );
                } );
            } )
            .catch( reason => {
              reject( reason );
            } );
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
}

module.exports = BoProxy;
