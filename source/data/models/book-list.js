'use strict';

import BookListItem from './book-list-item.js';

const Model = bo.ModelComposer;

const BookList = new Model( 'BookList:book-list' )
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
