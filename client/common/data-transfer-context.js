'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import ModelError from './model-error.js';
import PropertyInfo from './property-info.js';

//endregion

//region Private variables

const _getValue = new WeakMap();
const _setValue = new WeakMap();

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
 * Provides the context for custom data transfer objects.
 *
 * @memberof bo.common
 */
class DataTransferContext {

  //region Constructor

  /**
   * Creates a new data transfer context object.
   *
   * _**Warning:** Data transfer context objects are created in models internally.
   * They are intended only to make publicly available the values of model properties
   * for custom data transfer objects._
   *
   * @param {Array.<bo.common.PropertyInfo>} [properties] - An array of property definitions.
   * @param {internal~getValue} [getValue] - A function that returns the current value of a property.
   * @param {internal~setValue} [setValue] - A function that changes the current value of a property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The properties must be an array
   *    of PropertyInfo objects, or a single PropertyInfo object or null.
   * @throws {@link bo.system.ArgumentError Argument error}: The getValue argument must be a function.
   * @throws {@link bo.system.ArgumentError Argument error}: The setValue argument must be a function.
   */
  constructor( properties, getValue, setValue ) {
    const check = Argument.inConstructor( DataTransferContext.name );

    /**
     * Array of property definitions that may appear on the data transfer object.
     * @member {Array.<bo.common.PropertyInfo>} bo.common.DataTransferContext#properties
     * @readonly
     */
    this.properties = check( properties ).forOptional( 'properties' ).asArray( PropertyInfo );

    _getValue.set( this, check( getValue ).forOptional( 'getValue' ).asFunction() );
    _setValue.set( this, check( setValue ).forOptional( 'setValue' ).asFunction() );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Methods

  /**
   * Gets the current value of a model property.
   * _Permissions are not checked._
   *
   * @param {string} propertyName - The name of the property.
   * @returns {*} The value of a model property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
   */
  getValue( propertyName ) {
    const getValue = _getValue.get( this );
    if (getValue) {
      propertyName = Argument.inMethod( DataTransferContext.name, 'getValue' )
        .check( propertyName ).forMandatory( 'propertyName' ).asString();
      return getValue( getByName( this.properties, propertyName ) );
    } else
      throw new ModelError( 'getValue' );
  }

  /**
   * Sets the current value of a model property.
   * _Permissions are not checked._
   *
   * @param {string} propertyName - The name of the property.
   * @param {*} value - The new value of the property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
   */
  setValue( propertyName, value ) {
    const setValue = _setValue.get( this );
    if (setValue) {
      propertyName = Argument.inMethod( DataTransferContext.name, 'setValue' )
        .check( propertyName ).forMandatory( 'propertyName' ).asString();
      if (value !== undefined) {
        setValue( getByName( this.properties, propertyName ), value );
      }
    } else
      throw new ModelError( 'default' );
  }

  //endregion
}

export default DataTransferContext;
