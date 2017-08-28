'use strict';

import BookTagsView from './book-tags-view.js';

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;

const BookItemView = new Model( 'BookItemView' )
  .readOnlyChildObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookKey', F.key )
  .text( 'author' )
  .text( 'title' )
  .dateTime( 'publishDate' )
  .decimal( 'price' )
  .boolean( 'used' )
  .property( 'tags', BookTagsView )
  // --- Build model class
  .compose();

export default BookItemView;
