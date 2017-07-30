'use strict';

//region Imports

import configuration from './../system/configuration-reader.js';
import Argument from '../system/argument-check.js';
import ModelError from './model-error.js';
import PropertyInfo from './property-info.js';

//endregion

//region Private variables

const _getValue = new WeakMap();
const _setValue = new WeakMap();
const _isDirty = new WeakMap();
const _connection = new WeakMap();
const _fulfill = new WeakMap();
const _reject = new WeakMap();

//endregion

//region Helper methods

function getByName( properties, name ) {
  for (let i = 0; i < properties.length; i++) {
    if (properties[ i ].name === name)
      return properties[ i ];
  }
  throw new ModelError( 'noProperty', properties.name, name );
}

//endregion

/**
 * Provides the context for custom data portal actions.
 *
 * @memberof bo.common
 */
class DataPortalContext {

  //region Constructor

  /**
   * Creates a new data context object.
   *   </br></br>
   * <i><b>Warning:</b> Data portal context objects are created in models internally.
   * They are intended only to make publicly available the context
   * for custom data portal actions.</i>
   *
   * @param {object} dao - The data access object of the current model.
   * @param {Array.<bo.common.PropertyInfo>} properties - An array of property definitions.
   * @param {internal~getValue} [getValue] - A function that returns the current value of a property.
   * @param {internal~setValue} [setValue] - A function that changes the current value of a property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The dao argument must be an object.
   * @throws {@link bo.system.ArgumentError Argument error}: The properties must be an array
   *    of PropertyInfo objects, or a single PropertyInfo object or null.
   * @throws {@link bo.system.ArgumentError Argument error}: The getValue argument must be a function.
   * @throws {@link bo.system.ArgumentError Argument error}: The setValue argument must be a function.
   */
  constructor( dao, properties, getValue, setValue ) {
    const check = Argument.inConstructor( DataPortalContext.name );

    /**
     * The data access object of the current model.
     * @member {object} bo.common.DataPortalContext#dao
     * @readonly
     */
    this.dao = check( dao || {} ).forMandatory( 'dao' ).asObject();

    /**
     * Array of property definitions that may appear on the data transfer object.
     * @member {Array.<bo.common.PropertyInfo>} bo.common.DataPortalContext#properties
     * @readonly
     */
    this.properties = check( properties ).forOptional( 'properties' ).asArray( PropertyInfo );

    _getValue.set( this, check( getValue ).forOptional( 'getValue' ).asFunction() );
    _setValue.set( this, check( setValue ).forOptional( 'setValue' ).asFunction() );

    _isDirty.set( this, false );
    _connection.set( this, null );
    _fulfill.set( this, null );
    _reject.set( this, null );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Properties

  /**
   * The current user.
   * @member {bo.system.UserInfo} bo.common.DataPortalContext#user
   * @readonly
   */
  get user() {
    return configuration.getUser();
  }

  /**
   * The current locale.
   * @member {string} bo.common.DataPortalContext#locale
   * @readonly
   */
  get locale() {
    return configuration.getLocale();
  }

  /**
   * The connection object for the data source.
   * @member {object} bo.common.DataPortalContext#connection
   * @readonly
   */
  get connection() {
    return _connection.get( this );
  }

  /**
   * Indicates whether the current model itself has been changed.
   * @member {boolean} bo.common.DataPortalContext#isSelfDirty
   * @readonly
   */
  get isSelfDirty() {
    return _isDirty.get( this );
  }

  /**
   * The fulfilling function of the promise when extension manager
   * calls a custom data portal method.
   * @member {function} bo.common.DataPortalContext#fulfill
   * @readonly
   */
  get fulfill() {
    return _fulfill.get( this );
  }

  /**
   * The rejecting function of the promise when extension manager
   * calls a custom data portal method.
   * @member {function} bo.common.DataPortalContext#reject
   * @readonly
   */
  get reject() {
    return _reject.get( this );
  }

  //endregion

  //region Methods

  /**
   * Sets the current state of the model.
   *
   * @param {object} [connection] - The current connection for the data store.
   * @param {boolean} [isSelfDirty] - Indicates whether the current model itself has been changed.
   * @returns {bo.common.DataPortalContext} The data context object itself.
   */
  setState( connection, isSelfDirty ) {
    _connection.set( this, connection || null );
    _isDirty.set( this, isSelfDirty === true );
    return this;
  }

  /**
   * Sets the state setting functions of the promise when
   * extension manager calls a custom data portal method.
   *
   * @param {function} fulfill - The fulfill argument of the promise factory.
   * @param {function} reject - The reject argument of the promise factory.
   */
  setPromise( fulfill, reject ) {
    _fulfill.set( this, typeof fulfill === 'function' ? fulfill : null );
    _reject.set( this, typeof reject === 'function' ? reject : null );
  }

  /**
   * Gets the current value of a model property.
   *
   * @param {string} propertyName - The name of the property.
   * @returns {*} The value of the model property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
   * @throws {@link bo.common.ModelError Model error}: Cannot read the properties of a collection.
   */
  getValue( propertyName ) {
    propertyName = Argument.inMethod( DataPortalContext.name, 'getValue' )
      .check( propertyName ).forMandatory( 'propertyName' ).asString();
    const getValue = _getValue.get( this );
    if (getValue)
      return getValue( getByName( this.properties, propertyName ) );
    else
      throw new ModelError( 'readCollection', this.properties.name, propertyName );
  }

  /**
   * Sets the current value of a model property.
   *
   * @param {string} propertyName - The name of the property.
   * @param {*} value - The new value of the property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
   * @throws {@link bo.common.ModelError Model error}: Cannot write the properties of a collection.
   */
  setValue( propertyName, value ) {
    propertyName = Argument.inMethod( DataPortalContext.name, 'setValue' )
      .check( propertyName ).forMandatory( 'propertyName' ).asString();
    const setValue = _setValue.get( this );
    if (setValue) {
      if (value !== undefined) {
        setValue( getByName( this.properties, propertyName ), value );
      }
    } else
      throw new ModelError( 'writeCollection', this.properties.name, propertyName );
  }

  //endregion

  //region Call DAO methods

  /**
   * Calls a method on the data access object with current context.
   * The method is a shorthand for `dpContext.dao.$runMethod( methodName, dpContext.connection, methodArg )`.
   *
   * @param {string} methodName - The name of the method to call.
   * @param {*} methodArg - Additional argument of the method to call.
   * @returns {Promise.<*>} Returns a promise to the result of the method.
   */
  call( methodName, methodArg ) {
    return this.dao.$runMethod( methodName, this.connection, methodArg );
  }

  /**
   * Calls the create method on the data access object with current context.
   * The method is a shorthand for `dpContext.dao.$runMethod( 'create', dpContext.connection )`.
   *
   * @returns {Promise.<*>} Returns a promise to the result of the create method.
   */
  create() {
    return this.dao.$runMethod( 'create', this.connection );
  }

  /**
   * Calls the fetch method on the data access object with current context.
   * The method is a shorthand for `dpContext.dao.$runMethod( 'fetch', dpContext.connection, filter )`.
   *
   * @param {*} filter - The search conditions of the retrieval.
   * @returns {Promise.<*>} Returns a promise to the result of the fetch method.
   */
  fetch( filter ) {
    return this.dao.$runMethod( 'fetch', this.connection, filter );
  }

  /**
   * Calls the insert method on the data access object with current context.
   * The method is a shorthand for `dpContext.dao.$runMethod( 'insert', dpContext.connection, data )`.
   *
   * @param {*} data - The data transfer object.
   * @returns {Promise.<*>} Returns a promise to the result of the insert method.
   */
  insert( data ) {
    return this.dao.$runMethod( 'insert', this.connection, data );
  }

  /**
   * Calls the update method on the data access object with current context.
   * The method is a shorthand for `dpContext.dao.$runMethod( 'update', dpContext.connection, data )`.
   *
   * @param {*} data - The data transfer object.
   * @returns {Promise.<*>} Returns a promise to the result of the update method.
   */
  update( data ) {
    return this.dao.$runMethod( 'update', this.connection, data );
  }

  /**
   * Calls the remove method on the data access object with current context.
   * The method is a shorthand for `dpContext.dao.$runMethod( 'remove', dpContext.connection, filter )`.
   *
   * @param {*} filter - The search conditions of the removal.
   * @returns {Promise.<null>} Returns a promise to the result of the remove method, i.e. to a null.
   */
  remove( filter ) {
    return this.dao.$runMethod( 'remove', this.connection, filter );
  }

  /**
   * Calls the execute method on the data access object with current context.
   * The method is a shorthand for `dpContext.dao.$runMethod( 'execute', dpContext.connection, data )`.
   *
   * @param {*} data - The data transfer object.
   * @returns {Promise.<*>} Returns a promise to the result of the execute method.
   */
  execute( data ) {
    return this.dao.$runMethod( 'execute', this.connection, data );
  }

  //endregion
}

export default DataPortalContext;
