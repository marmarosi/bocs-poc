'use strict';

import BookTagsView from './book-tags-view.js';

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;
const cr = bo.commonRules;

const BookView = new Model( 'BookView : book-view' )
  .readOnlyRootObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookKey', F.key )
  .text( 'author' )
  .text( 'title' )
  .dateTime( 'publishDate' )
  .decimal( 'price' )
    .canRead( cr.isInAnyRole, [ 'salesmen', 'administrators' ], 'You are not authorized to view the price of the book.' )
  .boolean( 'used' )
  .property( 'tags', BookTagsView )
  // --- Permissions
  .canFetch( cr.isInRole, 'designers', 'You are not authorized to retrieve book.' )
  // --- Build model class
  .compose();

class BookViewFactory {
  get( key, eventHandlers ) {
    return BookView.fetch( key, 'get', eventHandlers );
  }
  getByTitle( title, eventHandlers ) {
    return BookView.fetch( title, 'get-by-title', eventHandlers );
  }
}

export default new BookViewFactory();
