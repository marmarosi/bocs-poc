'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import ModelError from './model-error.js';

//endregion

//region Private variables

const _methods = new WeakMap();
const _otherMethods = new WeakMap();

//endregion

//region Helper methods

function getMethod( name ) {
  const methods = _methods.get( this );
  return methods.get( name );
}

function setMethod( name, arity, value ) {

  if (value && typeof value === 'function' && value.length == arity) {
    const methods = _methods.get( this );
    methods.set( name, value );
    _methods.set( this, methods );
  }
  else {
    const className = this.constructor.name;
    switch (arity) {
      case 0:
        throw new ModelError( 'propertyArg0', className, name );
      case 1:
        throw new ModelError( 'propertyArg1', className, name );
      default:
        throw new ModelError( 'propertyArgN', className, name, arity );
    }
  }
}

//endregion

/**
 * Provides properties to customize models' behavior.
 *
 * @memberof bo.common
 */
class ExtensionManager {

  //region Constructor

  /**
   * Creates a new extension manager object.
   */
  constructor() {

    _methods.set( this, new Map() );
    _otherMethods.set( this, new Set() );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Properties for the custom methods

  /**
   * Converts the model instance to data transfer object.
   * @member {external.toDto} bo.common.ExtensionManager#toDto
   */
  get toDto() {
    return getMethod.call( this, 'toDto' );
  }
  set toDto( value ) {
    setMethod.call( this, 'toDto', 1, value );
  }

  /**
   * Converts the data transfer object to model instance.
   * @member {external.fromDto} bo.common.ExtensionManager#fromDto
   */
  get fromDto() {
    return getMethod.call( this, 'fromDto' );
  }
  set fromDto( value ) {
    setMethod.call( this, 'fromDto', 2, value );
  }

  //endregion

  //region Command object extensions

  /**
   * Adds a new instance method to the model.
   * (The method will call a custom execute method on a command object instance.)
   *
   * @param {string} methodName - The name of the method on the data access object to be called.
   */
  addOtherMethod( methodName ) {

    methodName = Argument.inMethod( ExtensionManager.name, 'addOtherMethod' )
      .check( methodName ).forMandatory( 'methodName' ).asString();

    const otherMethods = _otherMethods.get( this );
    otherMethods.add( methodName );
    _otherMethods.set( this, otherMethods );
  }

  /**
   * Instantiate the defined custom methods on the model instance.
   * (The method is currently used by command objects only.)
   *
   * @protected
   * @param {ModelBase} instance - An instance of the model.
   */
  buildOtherMethods( instance ) {
    const otherMethods = _otherMethods.get( this );
    if (otherMethods.size) {
      otherMethods.forEach( function ( methodName ) {
        instance[ methodName ] = function () {
          return instance.execute( methodName );
        };
      } );
    }
  }

  //endregion
}

export default ExtensionManager;
