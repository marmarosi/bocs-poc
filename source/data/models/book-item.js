'use strict';

//const bo = require( 'business-objects' );
import BookTags from './book-tags.js';

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;

const BookItem = new Model( 'BookItem' )
  .editableChildObject( 'memdb', __filename )
  // --- Properties
  // --- Properties
  .integer( 'bookKey', F.key | F.readOnly )
  .text( 'author' )
    .required()
  .text( 'title' )
    .required()
  .dateTime( 'publishDate' )
  .decimal( 'price' )
  .boolean( 'used' )
  .property( 'tags', BookTags )
  // --- Build model class
  .compose();

export default BookItem;
