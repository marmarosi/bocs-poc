'use strict';

//const bo = require( 'business-objects' );
import BookListItem from './book-list-item.js';

const Model = bo.ModelComposer;

const BookList = new Model( 'admin/BookList' )
  .readOnlyRootCollection( 'memdb', __filename )
  // --- Collection elements
  .itemType( BookListItem )
  // --- Build model class
  .compose();

class BookListFactory {
  ['get-all']( eventHandlers ) {
    return BookList.fetch( null, null, eventHandlers );
  }
}

export default new BookListFactory();
