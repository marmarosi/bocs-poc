'use strict';

import BookItemView from './book-item-view.js';

const Model = bo.ModelComposer;
const cr = bo.commonRules;

const FindBestseller = new Model( 'FindBestseller : find-bestseller' )
  .commandObject( 'dao', __filename )
  // --- Properties
  .integer( 'publishYear' )
  .text( 'tag1' )
  .text( 'tag2' )
  .text( 'tag3' )
  .property( 'result', BookItemView )
  // --- Permissions
  //  .canExecute( cr.isInRole, 'administrators', 'You are not authorized to execute the command.' )
  .canCall( 'inYearByTags', cr.isInRole, 'administrators', 'You are not authorized to execute the command.' )
  // --- Build model class
  .addMethod( 'inYearByTags', 'in-year-by-tags' )
  .compose();

class FindBestsellerFactory {
  create( eventHandlers ) {
    return FindBestseller.create( eventHandlers );
  }
}

export default new FindBestsellerFactory();
