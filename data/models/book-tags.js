'use strict';

const bo = require( 'business-objects' );
const BookTag = require( './book-tag.js' );

const Model = bo.ModelComposer;

const BookTags = new Model( 'BookTags' )
  .editableChildCollection()
  // --- Collection elements
  .itemType( BookTag )
  // --- Build model class
  .compose();

module.exports = BookTags;
