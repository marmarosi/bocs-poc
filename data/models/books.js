'use strict';

const bo = require( 'business-objects' );
const FactoryBase = require( '../factory-base.js' );
const BookItem = require( './book-item.js' );

const Model = bo.ModelComposer;

const Books = new Model( 'Books' )
  .editableRootCollection( 'memdb', __filename )
  // --- Collection elements
  .itemType( BookItem )
  // --- Build model class
  .compose();

class BooksFactory extends FactoryBase {
  constructor() {
    super( 'books', {
      'get-all': 'getAll',
      'get-from-to': 'getFromTo'
    } );
  }
  create( eventHandlers ) {
    return Books.create( eventHandlers );
  }
  getAll( eventHandlers ) {
    return Books.fetch( null, null, eventHandlers );
  }
  getFromTo( from, to, eventHandlers ) {
    return Books.fetch( { from: from, to: to }, 'fetchFromTo', eventHandlers );
  }
}

module.exports = new BooksFactory();
