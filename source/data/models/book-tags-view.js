'use strict';

import BookTagView from './book-tag-view.js';

const Model = bo.ModelComposer;

const BookTagsView = new Model( 'BookTagsView' )
  .readOnlyChildCollection()
  // --- Collection elements
  .itemType( BookTagView )
  // --- Build model class
  .compose();

export default BookTagsView;
