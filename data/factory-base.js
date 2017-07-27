'use strict';

const bo = require( 'business-objects' );
const Argument = bo.system.Argument;

class FactoryBase {
  constructor( modelUri ) {
    this.modelUri = Argument.check( modelUri ).forMandatory()
      .asString( 'Missing model URI.' );
  }
}

module.exports = FactoryBase;
