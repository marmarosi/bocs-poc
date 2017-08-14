'use strict';

const bo = require( 'business-objects' );
const BookTagView = require( './book-tag-view.js' );

const Model = bo.ModelComposer;

const BookTagsView = new Model( 'BookTagsView' )
  .readOnlyChildCollection()
  // --- Collection elements
  .itemType( BookTagView )
  // --- Build model class
  .compose();

module.exports = BookTagsView;
