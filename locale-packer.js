"use strict";

const fs = require( 'fs' );
const path = require( 'path' );

const NS_ROOT = '$default';
const NS_BO = '$bo';

let locales = {};

function readProjectLocales( pathOfLocales ) {
  // Read default namespace.
  readLocales( NS_ROOT, pathOfLocales );

  // Read other namespaces.
  fs.readdirSync( pathOfLocales ).filter( function ( directoryName ) {
    return fs.statSync( path.join( pathOfLocales, directoryName ) ).isDirectory() &&
      path.extname( directoryName ) !== NS_ROOT &&
      path.extname( directoryName ) !== NS_BO;
  } ).forEach( function ( directoryName ) {
    readLocales( directoryName, path.join( pathOfLocales, directoryName ) );
  } );
}

function readLocales( namespace, localePath ) {
  locales[ namespace ] = {};
  fs.readdirSync( localePath ).filter( function ( fileName ) {
    return fs.statSync( path.join( localePath, fileName ) ).isFile() && path.extname( fileName ) === '.json';
  } ).forEach( function ( fileName ) {
    const filePath = path.join( localePath, fileName );
    locales[ namespace ][ path.basename( fileName, '.json' ) ] = require( filePath );
  } );
  mergeLocales( namespace );
}

function mergeLocales( namespace ) {
  for (const langExt in locales[ namespace ]) {
    if (locales[ namespace ].hasOwnProperty( langExt )) {
      const ix = langExt.indexOf( '.' );
      if (ix > 0) {
        // It is an extension.
        const langBase = langExt.substr( 0, ix );
        const objExt = locales[ namespace ][ langExt ];
        let objBase = locales[ namespace ][ langBase ];
        if (!objBase)
          objBase = {};
        // Copy items to base language.
        for (const key in objExt) {
          if (objExt.hasOwnProperty( key )) {
            if (objBase[ key ])
              console.log( 'Duplicated locale: ' + namespace + '["' + langExt + '"].' + key +
                ' => ' + namespace + '.' + langBase + '.' + key );
            else
              objBase[ key ] = objExt[ key ];
          }
        }
        // Remove extension.
        delete locales[ namespace ][ langExt ];
      }
    }
  }
}

function writeLocales( pathOfLocales ) {
  fs.writeFileSync( pathOfLocales, JSON.stringify( locales ) );
}

// Pack business-objects locales.
const bolDirectories = {
  'client/locales': 'client/bo.locales.json',
  'locales': 'config/app.locales.json'
};
for (const bolDirectory in bolDirectories) {
  if (fs.existsSync( path.join( process.cwd(), bolDirectory ) )) {
    locales = {};
    if (bolDirectory === 'client/locales')
      readLocales( NS_BO, path.join( process.cwd(), bolDirectory ) );
    else
      readProjectLocales( path.join( process.cwd(), bolDirectory ) );
    writeLocales( bolDirectories[ bolDirectory ] );
  }
}
