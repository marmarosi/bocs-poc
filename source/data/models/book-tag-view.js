'use strict';

//const bo = require( 'business-objects' );

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;

const BookTagView = new Model( 'BookTagView' )
  .readOnlyChildObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookTagKey', F.key )
  .integer( 'bookKey', F.parentKey )
  .text( 'tag' )
  // --- Build model class
  .compose();

export default BookTagView;
