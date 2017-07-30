'use strict';

//region Imports

import config from './../system/configuration-reader.js';
import Argument from '../system/argument-check.js';
import ModelError from './model-error.js';
import DataPortalContext from './data-portal-context.js';

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
   *
   * @param {string} dataSource - The name of the data source.
   * @param {string} modelPath - The full path of the model.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The data source must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model path must be a non-empty string.
   */
  constructor( dataSource, modelPath ) {
    const check = Argument.inConstructor( ExtensionManager.name );

    /**
     * The name of the data source.
     * @member {string} bo.common.ExtensionManager#dataSource
     * @readonly
     */
    this.dataSource = check( dataSource ).forMandatory( 'dataSource' ).asString();

    /**
     * The path of the model definition.
     * @member {string} bo.common.ExtensionManager#modelPath
     * @readonly
     */
    this.modelPath = check( modelPath ).forMandatory( 'modelPath' ).asString();

    _methods.set( this, new Map() );
    _otherMethods.set( this, new Set() );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Properties for the custom methods

  /**
   * Factory method to create the data access object for a model instance.
   * @member {external.daoBuilder} bo.common.ExtensionManager#daoBuilder
   */
  get daoBuilder() {
    return getMethod.call( this, 'daoBuilder' );
  }
  set daoBuilder( value ) {
    setMethod.call( this, 'daoBuilder', 3, value );
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

  /**
   * Converts the model instance to client transfer object.
   * @member {external.toCto} bo.common.ExtensionManager#toCto
   */
  get toCto() {
    return getMethod.call( this, 'toCto' );
  }
  set toCto( value ) {
    setMethod.call( this, 'toCto', 1, value );
  }

  /**
   * Converts the client transfer object to model instance.
   * @member {external.fromCto} bo.common.ExtensionManager#fromCto
   */
  get fromCto() {
    return getMethod.call( this, 'fromCto' );
  }
  set fromCto( value ) {
    setMethod.call( this, 'fromCto', 2, value );
  }

  /**
   * Returns the property values of a new instance from the data source.
   * @member {external.dataCreate} bo.common.ExtensionManager#dataCreate
   */
  get dataCreate() {
    return getMethod.call( this, 'dataCreate' );
  }
  set dataCreate( value ) {
    setMethod.call( this, 'dataCreate', 1, value );
  }

  /**
   * Returns the property values of an existing instance from the data source.
   * @member {external.dataFetch} bo.common.ExtensionManager#dataFetch
   */
  get dataFetch() {
    return getMethod.call( this, 'dataFetch' );
  }
  set dataFetch( value ) {
    setMethod.call( this, 'dataFetch', 3, value );
  }

  /**
   * Saves a new instance into the data source.
   * @member {external.dataInsert} bo.common.ExtensionManager#dataInsert
   */
  get dataInsert() {
    return getMethod.call( this, 'dataInsert' );
  }
  set dataInsert( value ) {
    setMethod.call( this, 'dataInsert', 1, value );
  }

  /**
   * Saves an existing instance into the data source.
   * @member {external.dataUpdate} bo.common.ExtensionManager#dataUpdate
   */
  get dataUpdate() {
    return getMethod.call( this, 'dataUpdate' );
  }
  set dataUpdate( value ) {
    setMethod.call( this, 'dataUpdate', 1, value );
  }

  /**
   * Deletes an existing instance from the data source.
   * @member {external.dataRemove} bo.common.ExtensionManager#dataRemove
   */
  get dataRemove() {
    return getMethod.call( this, 'dataRemove' );
  }
  set dataRemove( value ) {
    setMethod.call( this, 'dataRemove', 1, value );
  }

  /**
   * Executes a command on the data source.
   * @member {external.dataExecute} bo.common.ExtensionManager#dataExecute
   */
  get dataExecute() {
    return getMethod.call( this, 'dataExecute' );
  }
  set dataExecute( value ) {
    setMethod.call( this, 'dataExecute', 2, value );
  }

  //endregion

  //region Command object extensions

  /**
   * Adds a new instance method to the model.
   * (The method will call a custom execute method on a command object instance.)
   *
   * @param {string} methodName - The name of the method on the data access object to be called.
   * @param {boolean} [isTransaction] - Indicates whether transaction is required.
   */
  addOtherMethod( methodName, isTransaction ) {
    const check = Argument.inMethod( ExtensionManager.name, 'addOtherMethod' );

    methodName = check( methodName ).forMandatory( 'methodName' ).asString();
    isTransaction = check( isTransaction || false ).forMandatory( 'isTransaction' ).asBoolean();

    const otherMethods = _otherMethods.get( this );
    otherMethods.add( { name: methodName, trx: isTransaction } );
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
      otherMethods.forEach( function ( definition ) {
        instance[ definition.name ] = function () {
          return instance.execute( definition.name, definition.trx );
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
  getDataAccessObject( modelName ) {
    return this.daoBuilder ?
      this.daoBuilder( this.dataSource, this.modelPath, modelName ) :
      config.daoBuilder( this.dataSource, this.modelPath, modelName );
  }

  /**
   * Executes a custom data portal method.
   *
   * @param {string} methodName - The short name of the data portal method to execute.
   * @param {object} thisArg - The business object that executes the data portal method.
   *      E.g. 'update' for 'dataUpdate'.
   * @param {bo.common.DataPortalContext} dpContext - Tha data portal context
   *      of the custom data portal method.
   * @param {...*} [dpParams] - More optional parameters of the data portal method.
   * @returns {Promise.<object>} Returns a promise to the result of the custom data portal method.
   */
  $runMethod( methodName, thisArg, dpContext, dpParams ) {
    const check = Argument.inMethod( ExtensionManager.name, '$runMethod' );

    methodName = check( methodName ).forMandatory( 'methodName' ).asString();
    thisArg = check( thisArg ).forMandatory( 'thisArg' ).asObject();
    dpContext = check( dpContext ).forMandatory( 'dpContext' ).asType( DataPortalContext );

    methodName = 'data' + methodName[ 0 ].toUpperCase() + methodName.substr( 1 );
    const method = getMethod.call( this, methodName );
    if (method) {

      // Remove method name and execution context from arguments.
      const args = [ ...arguments ].slice( 2 );

      // Execute the custom data portal method.
      return new Promise( ( fulfill, reject ) => {
        dpContext.setPromise( fulfill, reject );
        method.apply( thisArg, args );
      } );
    }
  }

  //endregion
}

export default ExtensionManager;
