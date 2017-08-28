'use strict';

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;

const BookTag = new Model( 'BookTag' )
  .editableChildObject( 'dao', __filename )
  // --- Properties
  .integer( 'bookTagKey', F.key | F.readOnly )
  .integer( 'bookKey', F.parentKey | F.readOnly )
  .text( 'tag' )
  .required()
  // --- Build model class
  .compose();

export default BookTag;
