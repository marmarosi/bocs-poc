'use strict';

const bo = require( 'business-objects' );
const Model = bo.ModelComposer;
const FactoryBase = require( '../../factory-base.js' );

const BookListItem = require( './book-list-item.js' );

const BookList = new Model( 'BookList' )
  .readOnlyRootCollection( 'memdb', __filename )
  // --- Collection elements
  .itemType( BookListItem )
  // --- Build model class
  .compose();

class BookListFactory extends FactoryBase {
  constructor() {
    super( 'admin/book-list', {
      'get-all': 'getAll'
    } );
  }
  getAll( eventHandlers ) {
    return BookList.fetch( null, null, eventHandlers );
  }
}

module.exports = new BookListFactory();
