'use strict';

//const bo = require( 'business-objects' );
import BookListItem from './book-list-item.js';

const Model = bo.ModelComposer;

const BookList = new Model( 'admin/BookList:admin/book-list' )
  .readOnlyRootCollection( 'memdb', __filename )
  // --- Collection elements
  .itemType( BookListItem )
  // --- Build model class
  .compose();

class BookListFactory {
  getAll( eventHandlers ) {
    return BookList.fetch( null, 'get-all', eventHandlers );
  }
}

export default new BookListFactory();
