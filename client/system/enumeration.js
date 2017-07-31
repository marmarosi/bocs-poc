'use strict';

//region Imports

import Argument from './argument-check.js';
import EnumerationError from './enumeration-error.js';

//endregion

/**
 * Serves as the base class for enumerations.
 *
 * @memberof bo.system
 */
class Enumeration {

  /**
   * Creates a new enumeration.
   * The enumeration instances should be frozen.
   */
  constructor() {
    /**
     * The name of the enumeration. The default value is the name of the constructor.
     * @member {string} bo.system.Enumeration#$name
     * @readonly
     */
    this.$name = this.constructor.name;
  }

  /**
   * Returns the count of the items in enumeration.
   *
   * @function bo.system.Enumeration#count
   * @returns {number} The count of the enumeration items.
   */
  count() {
    let count = 0;
    for (const propertyName in this) {
      if (this.hasOwnProperty( propertyName ) && typeof this[ propertyName ] === 'number') {
        count++;
      }
    }
    return count;
  }

  /**
   * Returns the name of an enumeration item.
   *
   * @function bo.system.Enumeration#getName
   * @param {number} value - The enumeration item that name to be returned of.
   * @returns {string} The name of the enumeration item.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The value must be a number.
   * @throws {@link bo.system.EnumerationError Enumeration error}: The passed value is not an enumeration item.
   */
  getName( value ) {
    value = Argument.inMethod( this.constructor.name, 'getName' )
      .check( value ).forMandatory( 'value' ).asNumber();

    for (const propertyName in this) {
      if (this.hasOwnProperty( propertyName ) && typeof this[ propertyName ] === 'number') {
        if (this[ propertyName ] === value)
          return propertyName;
      }
    }
    throw new EnumerationError( 'enumValue', this.$name, value );
  }

  /**
   * Returns the value of an enumeration item based on its name.
   *
   * @function bo.system.Enumeration#getValue
   * @param {string} name - The enumeration item that value to be returned of.
   * @returns {number} The value of the enumeration item.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
   * @throws {@link bo.system.EnumerationError Enumeration error}: The passed name is not an enumeration item.
   */
  getValue( name ) {
    name = Argument.inMethod( this.constructor.name, 'getValue' )
      .check( name ).forMandatory( 'name' ).asString();

    for (const propertyName in this) {
      if (this.hasOwnProperty( propertyName ) && typeof this[ propertyName ] === 'number') {
        if (propertyName === name)
          return this[ propertyName ];
      }
    }
    throw new EnumerationError( 'enumName', this.$name, name );
  }

  /**
   * Determines if the enumeration has an item with the given name.
   *
   * @function bo.system.Enumeration#hasValue
   * @param {string} name - The name of the enumeration item.
   * @returns {boolean} True if the name is an enumeration item, otherwise false.
   */
  isMemberName( name ) {
    for (const propertyName in this) {
      if (this.hasOwnProperty( propertyName ) && typeof this[ propertyName ] === 'number') {
        if (propertyName === name)
          return true;
      }
    }
    return false;
  }

  /**
   * Checks whether the enumeration has an item with the given value.
   * If not, throws an error.
   *
   * @function bo.system.Enumeration#check
   * @param {number} value - The value to check.
   * @param {string} [message] - Human-readable description of the error.
   *
   * @throws {@link bo.system.EnumerationError Enumeration error}: The passed value is not an enumeration item.
   */
  check( value, message ) {
    for (const propertyName in this) {
      if (this.hasOwnProperty( propertyName ) && typeof this[ propertyName ] === 'number') {
        if (this[ propertyName ] === value)
          return;
      }
    }
    throw new EnumerationError( message || 'enumValue', this.$name, value );
  }

  /**
   * Determines if the enumeration has an item with the given value.
   *
   * @function bo.system.Enumeration#hasMember
   * @param {number} value - The value to check.
   * @returns {boolean} True if the value is an enumeration item, otherwise false.
   */
  hasMember( value ) {
    for (const propertyName in this) {
      if (this.hasOwnProperty( propertyName ) && typeof this[ propertyName ] === 'number') {
        if (this[ propertyName ] === value)
          return true;
      }
    }
    return false;
  }
}

export default Enumeration;
