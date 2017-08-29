'use strict';

const fs = require( 'fs' );

const cache = { };

function engine( filePath, options, callback ) {

  reader( filePath, function ( err, rendered ) {
    if (err) return callback( err );

    for (const prop in options) {
      if (options.hasOwnProperty( prop ) && typeof options[ prop ] !== 'object')
        rendered = rendered.replace( '#' + prop + '#', options[ prop ] );
    }
    return callback( null, rendered );
  } );
}

function reader( filePath, callback ) {

  if (cache[ filePath ])
    return callback( null, cache[ filePath ]);

  fs.readFile( filePath, function (err, content) {
    if (err)
      return callback( err );

    cache[ filePath ] = content.toString();
    return callback( null, content.toString() );
  })
}

module.exports = engine;
