'use strict';
require("@std/esm");

const Bear = require( './module-2.js' ).default;

const bear = new Bear( 'brown ' );
console.log( bear );

const express = require( 'express' );
const serveStatic = require( 'serve-static') ;
const bodyParser = require('body-parser');
const bo = require( 'business-objects' );
const te = require( './template-engine.js' );
const ApiPortal = require( './api-portal.js' );
//const appLocales = require( './config/app.locales.json' );

const app = express();

function read ( filename ) {
  return require( '../../source/' + filename );
}
app.engine( 'html', te );
app.set( 'views', './views' );
app.set( 'view engine', 'html' );

// Serve static files.
app.use( serveStatic( 'public', { index: false } ) );

bo.initialize( '/config/business-objects.js' /*, appLocales*/ );
const apiPortal = new ApiPortal( '/api/', '/data/models' );

//region Routes

app.get( '/', function ( req, res ) {
  res.render( 'home', { title: 'Home', message: 'Hello world!' } );
} );
app.get( '/find-bestseller', function ( req, res ) {
  res.render( 'find-bestseller', {} );
} );
app.get( '/book-list', function ( req, res ) {
  res.render( 'book-list', {} );
} );
app.get( '/admin-book-list', function ( req, res ) {
  res.render( 'admin-book-list', {} );
} );
app.get( '/book-view/:id', function ( req, res ) {
  res.render( 'book-view', {} );
} );
app.get( '/book-new', function ( req, res ) {
  res.render( 'book-new', {} );
} );
app.get( '/book-edit/:id', function ( req, res ) {
  res.render( 'book-edit', {} );
} );
app.get( '/edit-books', function ( req, res ) {
  res.render( 'edit-books', {} );
} );

//endregion

// create application/json parser
const jsonParser = bodyParser.json();

app.post( '/api/*', jsonParser, function ( req, res ) {
  apiPortal.process( req, res )
    .then( result => {
      res.send( result );
    } )
    .catch( reason => {
      console.log( reason );
    });
} );

app.listen( 3000 );
