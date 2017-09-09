'use strict';

//region Imports

import config from '../system/configuration.js';
import Argument from '../system/argument-check.js';
import ApiClient from '../api-access/api-client.js';
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

  if (value && typeof value === 'function' && value.length === arity) {
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

function getApiClient( config ) {

  return new ApiClient( config );
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
   * Factory method to create the API access object for a model instance.
   * @member {external.acoBuilder} bo.common.ExtensionManager#acoBuilder
   */
  get acoBuilder() {
    return getMethod.call( this, 'acoBuilder' );
  }
  set acoBuilder( value ) {
    setMethod.call( this, 'acoBuilder', 1, value );
  }

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
   * @param {string} [wpAltName] - Optional alternative method name for the web portal.
   */
  addOtherMethod( methodName, wpAltName ) {

    const check = Argument.inMethod( ExtensionManager.name, 'addOtherMethod' );
    methodName = check( methodName ).forMandatory( 'methodName' ).asString();
    wpAltName = check( wpAltName ).forOptional( 'wpAltName' ).asString();

    const otherMethods = _otherMethods.get( this );
    otherMethods.add( {
      name: methodName,
      uri: wpAltName
    } );
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
      otherMethods.forEach( method => {
        instance[ method.name ] = function () {
          return instance.execute( method.uri || method.name );
        };
      } );
    }
  }

  //endregion

  //region Methods

  /**
   * Gets the data access object instance of the model.
   *
   * @function bo.common.ExtensionManager#getDataAccessObject
   * @protected
   * @param {string} modelName - The name of the model.
   * @returns {bo.dataAccess.DaoBase} The data access object instance of the model.
   */
  getApiClientObject() {
    return this.acoBuilder ?
      this.acoBuilder( config ) :
      getApiClient( config );
  }

  //endregion
}

export default ExtensionManager;
