'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import PropertyInfo from './property-info.js';
import CollectionBase from './collection-base.js';
import ModelBase from './model-base.js';

//endregion

//region Private variables

const _data = new WeakMap();
const _validity = new WeakMap();

//endregion

//region Helper methods

function getPropertyValue( propertyName ) {
  const data = _data.get( this );
  return data.get( propertyName );
}

function setPropertyValue( propertyName, value ) {
  const data = _data.get( this );
  data.set( propertyName, value );
  _data.set( this, data );
}

function getValidity( propertyName ) {
  const validity = _validity.get( this );
  return validity.get( propertyName ) || false;
}

function setValidity( propertyName, value ) {
  const validity = _validity.get( this );
  validity.set( propertyName, value );
  _validity.set( this, validity );
}

//endregion

/**
 * Provides methods to manage the values of business object model's properties.
 *
 * @memberof bo.common
 */
class DataStore {

  //region Constructor

  /**
   * Creates a new data store object.
   */
  constructor() {

    _data.set( this, new Map() );
    _validity.set( this, new Map() );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Methods

  /**
   * Initializes the value of a property in the store.
   *
   * @param {bo.common.PropertyInfo} property - The definition of the model property.
   * @param {*} value - The default value of the property (null or a child object).
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The value must be null, a model or a collection.
   */
  initValue( property, value ) {
    const check = Argument.inMethod( DataStore.name, 'initValue' );

    property = check( property ).forMandatory( 'property' ).asType( PropertyInfo );
    value = check( value ).forOptional( 'value' ).asType( [ CollectionBase, ModelBase ] );

    setPropertyValue.call( this, property.name, value );
    setValidity.call( this, property.name, true );
  }

  /**
   * Gets the value of a model property.
   *
   * @param {bo.common.PropertyInfo} property - The definition of the model property.
   * @returns {*} The current value of the property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property must be a PropertyInfo object.
   */
  getValue( property ) {

    property = Argument.inMethod( DataStore.name, 'getValue' )
      .check( property ).forMandatory( 'property' ).asType( PropertyInfo );

    return getPropertyValue.call( this, property.name );
  }

  /**
   * Sets the value of a model property.
   *
   * @param {bo.common.PropertyInfo} property - The definition of the model property.
   * @param {*} value - The new value of the property.
   * @returns {boolean} True if the value of the property has been changed, otherwise false.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The value must be defined.
   */
  setValue( property, value ) {
    const check = Argument.inMethod( DataStore.name, 'setValue' );

    property = check( property ).forMandatory( 'property' ).asType( PropertyInfo );
    value = check( value ).for( 'value' ).asDefined();

    // Check value.
    const parsed = property.type.parse( value );
    if (parsed === undefined) {
      // Invalid value.
      setValidity.call( this, property.name, false );
      return false;
    } else {
      // Valid value.
      if (parsed !== getPropertyValue.call( this, property.name )) {
        // Value has changed.
        setPropertyValue.call( this, property.name, parsed );
        setValidity.call( this, property.name, true );
        return true;
      } else {
        // Value is unchanged.
        setValidity.call( this, property.name, true );
        return false;
      }
    }
  }

  /**
   * Indicates whether a property has a valid value.
   *
   * @param {bo.common.PropertyInfo} property - The definition of the model property.
   * @returns {boolean} True if the property has a valid value, otherwise false.
   */
  hasValidValue( property ) {

    property = Argument.inMethod( DataStore.name, 'hasValidValue' )
      .check( property ).forMandatory( 'property' ).asType( PropertyInfo );

    return getValidity.call( this, property.name );
  }

  //endregion
}

export default DataStore;
