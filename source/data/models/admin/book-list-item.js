'use strict';

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;

const BookListItem = new Model( 'admin/BookListItem' )
  .readOnlyChildObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookKey', F.key )
  .text( 'author' )
  .text( 'title' )
  // --- Build model class
  .compose();

export default BookListItem;
