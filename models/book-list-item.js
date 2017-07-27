'use strict';

const bo = require( 'business-objects' );
const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;

const BookListItem = new Model( 'BookListItem' )
  .readOnlyChildObject( 'dao', __filename )
  // --- Properties
  .integer( 'bookKey', F.key )
  .text( 'author' )
  .text( 'title' )
  // --- Build model class
  .compose();

module.exports = BookListItem;
