'use strict';

//const bo = require( 'business-objects' );
import BookItem from './book-item.js';

const Model = bo.ModelComposer;

const Books = new Model( 'Books : books' )
  .editableRootCollection( 'memdb', __filename )
  // --- Collection elements
  .itemType( BookItem )
  // --- Build model class
  .compose();

class BooksFactory {
  create( eventHandlers ) {
    return Books.create( eventHandlers );
  }
  getAll( eventHandlers ) {
    return Books.fetch( null, 'getAll', eventHandlers );
  }
  getFromTo( from, to, eventHandlers ) {
    return Books.fetch( { from: from, to: to }, 'getFromTo', eventHandlers );
  }
}

export default new BooksFactory();
