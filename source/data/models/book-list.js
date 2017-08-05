'use strict';

//const bo = require( 'business-objects' );
import BookListItem from './book-list-item.js';

const Model = bo.ModelComposer;

const BookList = new Model( 'BookList' )
  .readOnlyRootCollection( 'memdb', __filename )
  // --- Collection elements
  .itemType( BookListItem )
  // --- Build model class
  .compose();

class BookListFactory {
  getAll( eventHandlers ) {
    return BookList.fetch( null, null, eventHandlers );
  }
}

export default new BookListFactory();
