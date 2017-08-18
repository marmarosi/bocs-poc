'use strict';

const bo = require( 'business-objects' );

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;

const BookTag = new Model( 'BookTag' )
  .editableChildObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookTagKey', F.key | F.readOnly )
  .integer( 'bookKey', F.parentKey | F.readOnly )
  .text( 'tag' )
  .required()
  // --- Build model class
  .compose();

module.exports = BookTag;
