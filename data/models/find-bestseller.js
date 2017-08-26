'use strict';

const bo = require( 'business-objects' );
const FactoryBase = require( '../factory-base.js' );
const BookItemView = require( './book-item-view.js' );

const Model = bo.ModelComposer;
const cr = bo.commonRules;

const FindBestseller = new Model( 'FindBestseller' )
  .commandObject( 'memdb', __filename )
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
  .addMethod( 'inYearByTags' )
  .compose();

class FindBestsellerFactory extends FactoryBase {
  constructor() {
    super( 'find-bestseller', {
      'in-year-by-tags': 'inYearByTags'
    }, true );
  }
  create( eventHandlers ) {
    return FindBestseller.create( eventHandlers );
  }
}

module.exports = new FindBestsellerFactory();
