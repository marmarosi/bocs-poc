'use strict';

const bo = require( 'business-objects' );
const FactoryBase = require( '../factory-base.js' );

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;
const cr = bo.commonRules;

const BookView = new Model( 'BookView' )
  .readOnlyRootObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookKey', F.key )
  .text( 'author' )
  .text( 'title' )
  .dateTime( 'publishDate' )
  .decimal( 'price' )
  .canRead( cr.isInAnyRole, [ 'salesmen', 'administrators' ], 'You are not authorized to view the totalPrice of the blanket order.' )
  .boolean( 'used' )
  // --- Permissions
  .canFetch( cr.isInRole, 'designers', 'You are not authorized to retrieve blanket order.' )
  // --- Build model class
  .compose();

class BookViewFactory extends FactoryBase {
  constructor() {
    super( 'book-view', {
      'get-by-title': 'getByTitle'
    } );
  }
  get( key, eventHandlers ) {
    return BookView.fetch( key, null, eventHandlers );
  }
  getByTitle( name, eventHandlers ) {
    return BookView.fetch( name, 'fetchByTitle', eventHandlers );
  }
}

module.exports = new BookViewFactory();
