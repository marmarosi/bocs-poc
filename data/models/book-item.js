'use strict';

const bo = require( 'business-objects' );
const Model = bo.ModelComposer;
const BookTags = require( './book-tags.js' );

const F = bo.common.PropertyFlag;

const BookItem = new Model( 'BookItem' )
  .editableChildObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookKey', F.key | F.readOnly )
  .text( 'author' )
    .required()
  .text( 'title' )
    .required()
  .dateTime( 'publishDate' )
  .decimal( 'price' )
  .boolean( 'used' )
  .property( 'tags', BookTags )
  // --- Build model class
  .compose();

module.exports = BookItem;
