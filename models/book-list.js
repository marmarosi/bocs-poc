'use strict';

const bo = require( 'business-objects' );
const Model = bo.ModelComposer;

const BookListItem = require( './book-list-item.js' );

const BookList = new Model( 'BookList' )
  .readOnlyRootCollection( 'dao', __filename )
  // --- Collection elements
  .itemType( BookListItem )
  // --- Build model class
  .compose();

const BookListFactory = {
  getAll: function ( eventHandlers ) {
    return BookList.fetch( null, null, eventHandlers );
  }
};

module.exports = BookListFactory;
