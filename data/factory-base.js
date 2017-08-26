'use strict';

const bo = require( 'business-objects' );
const Argument = bo.system.Argument;

class FactoryBase {
  constructor( modelUri, methodMap, isCommand ) {

    this.$modelUri = Argument.check( modelUri ).forMandatory()
      .asString( 'Missing model URI.' );
    this.$methodMap = Argument.check( methodMap ).forOptional()
      .asObject( 'Invalid method map.' ) || { };
    this.$isCommand = Argument.check( isCommand ).forOptional()
      .asBoolean( 'IsCommand must be Boolean' );
  }
}

module.exports = FactoryBase;
