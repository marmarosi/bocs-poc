'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import ModelError from './model-error.js';
import PropertyInfo from './property-info.js';

//endregion

//region Private variables

const _readValue = new WeakMap();
const _writeValue = new WeakMap();

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
 * Provides the context for custom client transfer objects.
 *
 * @memberof bo.common
 */
class ClientTransferContext {

  //region Constructor

  /**
   * Creates a new client transfer context object.
   *   </br></br>
   * <i><b>Warning:</b> Client transfer context objects are created in models internally.
   * They are intended only to make publicly available the values of model properties
   * for custom client transfer objects.</i>
   *
   * @param {Array.<bo.common.PropertyInfo>} [properties] - An array of property definitions.
   * @param {internal~readValue} [readValue] - A function that returns the current value of a property.
   * @param {internal~writeValue} [writeValue] - A function that changes the current value of a property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The properties must be an array
   *    of PropertyInfo objects, or a single PropertyInfo object or null.
   * @throws {@link bo.system.ArgumentError Argument error}: The readValue argument must be a function.
   * @throws {@link bo.system.ArgumentError Argument error}: The writeValue argument must be a function.
   */
  constructor( properties, readValue, writeValue ) {
    const check = Argument.inConstructor( ClientTransferContext.name );

    /**
     * Array of property definitions that may appear on the transfer object.
     * @member {Array.<bo.common.PropertyInfo>} bo.common.ClientTransferContext#properties
     * @readonly
     */
    this.properties = check( properties ).forOptional( 'properties' ).asArray( PropertyInfo );

    _readValue.set( this, check( readValue ).forOptional( 'readValue' ).asFunction() );
    _writeValue.set( this, check( writeValue ).forOptional( 'writeValue' ).asFunction() );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Methods

  /**
   * Reads the current value of a model property.
   * _Permissions are checked before reading the value._
   *
   * @param {string} propertyName - The name of the property.
   * @returns {*} The value of a model property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
   */
  readValue( propertyName ) {
    const readValue = _readValue.get( this );
    if (readValue) {
      propertyName = Argument.inMethod( ClientTransferContext.name, 'readValue' )
        .check( propertyName ).forMandatory( 'propertyName' ).asString();
      return readValue( getByName( this.properties, propertyName ) );
    } else
      throw new ModelError( 'default' );
  }

  /**
   * Writes the current value of a model property.
   * _Permissions are checked before writing the value._
   *
   * @param {string} propertyName - The name of the property.
   * @param {*} value - The new value of the property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
   */
  writeValue( propertyName, value ) {
    const writeValue = _writeValue.get( this );
    if (writeValue) {
      propertyName = Argument.inMethod( ClientTransferContext.name, 'writeValue' )
        .check( propertyName ).forMandatory( 'propertyName' ).asString();
      if (value !== undefined) {
        writeValue( getByName( this.properties, propertyName ), value );
      }
    } else
      throw new ModelError( 'writeValue' );
  }

  //endregion
}

export default ClientTransferContext;
