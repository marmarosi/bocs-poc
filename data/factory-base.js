'use strict';

const bo = require( 'business-objects' );
const Argument = bo.system.Argument;

class FactoryBase {
  constructor( modelUri, methodMap, fetchMethod ) {

    this.$modelUri = Argument.check( modelUri ).forMandatory()
      .asString( 'Missing model URI.' );
    this.$methodMap = Argument.check( methodMap ).forOptional()
      .asObject( 'Invalid method map.' ) || { };
    this.$fetch = Argument.check( fetchMethod ).forOptional()
      .asString() || 'fetch';
  }
}

module.exports = FactoryBase;
