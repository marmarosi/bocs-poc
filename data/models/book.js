'use strict';

const bo = require( 'business-objects' );
const FactoryBase = require( '../factory-base.js' );
const BookTags = require( './book-tags.js' );

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;
const cr = bo.commonRules;

const Book = new Model( 'Book' )
  .editableRootObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookKey', F.key | F.readOnly )
  .text( 'author' )
  .text( 'title' )
  .dateTime( 'publishDate' )
  .decimal( 'price' )
  .boolean( 'used' )
  .property( 'tags', BookTags )
  // --- Permissions
  .canFetch( cr.isInRole, 'developers', 'You are not authorized to retrieve book.' )
  .canCreate( cr.isInRole, 'developers', 'You are not authorized to create book.' )
  .canUpdate( cr.isInRole, 'developers', 'You are not authorized to modify book.' )
  .canRemove( cr.isInRole, 'developers', 'You are not authorized to delete book.' )
  // --- Build model class
  .compose();

class BookFactory extends FactoryBase {
  constructor() {
    super( 'book', {
      'get-by-title': 'getByTitle'
      } );
  }
  create( eventHandlers ) {
    return Book.create( eventHandlers );
  }
  get( key, eventHandlers ) {
    return Book.fetch( key, null, eventHandlers );
  }
  getByTitle( name, eventHandlers ) {
    return Book.fetch( name, 'fetchByTitle', eventHandlers );
  }
}

module.exports = new BookFactory();
