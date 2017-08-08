'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import DataType from '../data-types/data-type.js';
import PropertyFlag from './property-flag.js';
import ModelBase from './model-base.js';
import CollectionBase from './collection-base.js';

//endregion

/**
 * Defines a property of a business object model.
 *
 * @memberof bo.common
 */
class PropertyInfo {

  /**
   * Creates a new property definition.
   *   </br></br>
   * The data type can be any one from the {@link bo.dataTypes} namespace
   * or a custom data type based on {@link bo.dataTypes.DataType DataType} object,
   * or can be any business object model or collection defined by the
   * model types available in the {@link bo} namespace (i.e. models based on
   * {@link ModelBase ModelBase} or {@link CollectionBase CollectionBase}
   * objects).
   *   </br></br>
   * The flags parameter is ignored when data type is a model or collection.
   *
   * @param {string} name - The name of the property.
   * @param {*} type - The data type of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The type must be a data type, a model or a collection.
   * @throws {@link bo.system.ArgumentError Argument error}: The flags must be PropertyFlag items.
   */
  constructor( name, type, flags, getter, setter ) {

    const check = Argument.inConstructor( PropertyInfo.name );

    /**
     * The name of the property.
     * @type {string}
     * @readonly
     */
    this.name = check( name ).forMandatory( 'name' ).asString();

    /**
     * The data type of the property.
     *    </br></br>
     * The data type can be any one from the {@link bo.dataTypes} namespace
     * or a custom data type based on {@link bo.dataTypes.DataType DataType} object,
     * or can be any business object model or collection defined by the
     * model types available in the {@link bo} namespace (i.e. models based on
     * {@link ModelBase ModelBase} or {@link CollectionBase CollectionBase}
     * objects).
     *
     * @type {*}
     * @readonly
     */
    this.type = check( type ).forMandatory( 'type' ).asType( [
      DataType, ModelBase, CollectionBase ] );

    /**
     * The custom getter function of the property.
     * @type {external.propertyGetter}
     * @readonly
     */
    this.getter = check( getter ).forOptional( 'getter' ).asFunction();

    /**
     * The custom setter function of the property.
     * @type {external.propertySetter}
     * @readonly
     */
    this.setter = check( setter ).forOptional( 'setter' ).asFunction();

    flags = type instanceof DataType ?
      check( flags || PropertyFlag.none ).forMandatory( 'flags' ).asInteger() :
      PropertyFlag.readOnly;

    /**
     * Indicates whether the value of the property can be modified.
     * @type {string}
     * @readonly
     */
    this.isReadOnly = (flags & PropertyFlag.readOnly) === PropertyFlag.readOnly;
    /**
     * Indicates if the property is a key element.
     * @type {string}
     * @readonly
     */
    this.isKey = (flags & PropertyFlag.key) === PropertyFlag.key;
    /**
     * Indicates if the property is a key element of the parent object.
     * @type {string}
     * @readonly
     */
    this.isParentKey = (flags & PropertyFlag.parentKey) === PropertyFlag.parentKey;

    /**
     * Checks if value has the appropriate type and it is not null,
     * and not empty in case of Text data type.
     *
     * @function bo.common.PropertyInfo#hasValue
     * @param {data} value - The value to check.
     * @returns {boolean} True if the value is neither null nor empty, otherwise false.
     */
    this.hasValue = function ( value ) {
      return this.type.hasValue( value );
    };

    // Immutable object.
    Object.freeze( this );
  }
}

export default PropertyInfo;
