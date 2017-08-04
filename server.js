'use strict';

const express = require( 'express' );
const serveStatic = require( 'serve-static') ;
const bo = require( 'business-objects' );
const te = require( './template-engine.js' );
const BoProxy = require( './bo-proxy.js' );
const appLocales = require( './config/app.locales.json' );

const app = express();

function read ( filename ) {
  return require( '../../source/' + filename );
}
app.engine( 'html', te );
app.set( 'views', './views' );
app.set( 'view engine', 'html' );

// Serve static files.
app.use( serveStatic( 'public', { index: false } ) );

bo.initialize( '/config/business-objects.js', appLocales );
const boProxy = new BoProxy( '/api/', '/data/models' );

app.get( '/', function ( req, res ) {
  res.render( 'home', { title: 'Home', message: 'Hello world!' } );
} );

app.get( '/book-list', function ( req, res ) {
  res.render( 'book-list', {} );
} );

app.get( '/admin-book-list', function ( req, res ) {
  res.render( 'admin-book-list', {} );
} );

app.post( '/api/*', function ( req, res ) {
  boProxy.process( req, res )
    .then( result => {
      res.send( result );
    } )
    .catch( reason => {
      console.log( reason );
    });
} );

app.listen( 3000 );
