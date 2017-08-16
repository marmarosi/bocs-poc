'use strict';

//const bo = require( 'business-objects' );
import BookTag from './book-tag.js';

const Model = bo.ModelComposer;

const BookTags = new Model( 'BookTags' )
  .editableChildCollection()
  // --- Collection elements
  .itemType( BookTag )
  // --- Build model class
  .compose();

export default BookTags;
