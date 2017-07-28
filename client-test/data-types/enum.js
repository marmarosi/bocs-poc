'use strict';

import DataType from './data-type.js';
import Enumeration from '../system/enumeration.js';
import Argument from '../system/argument-check.js';

/**
 * Provide methods to work with enumeration data.
 *
 * @memberof bo.dataTypes
 * @extends bo.dataTypes.DataType
 */
class Enum extends DataType {

  /**
   * Creates enumeration data type definition.
   *
   * @param {bo.system.Enumeration} enumType - The type of the enumeration.
   */
  constructor( enumType ) {
    super();

    /**
     * Gets the type of the enumeration.
     * @member {bo.system.Enumeration} bo.dataTypes.Enum#type
     * @readonly
     */
    this.type = Argument.inConstructor( Enum.name )
      .check( enumType ).forMandatory( 'enumType' ).asType( Enumeration );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if value is a Enum data.
   * Its value must be one of the defined enumeration values or null.
   *
   * @function bo.dataTypes.Enum#parse
   * @param {*} value - The value to check.
   * @returns {*} The Enum value or null when the input value is valid, otherwise undefined.
   */
  parse( value ) {

    if (value === null)
      return value;
    if (value === undefined)
      return null;

    const member = value instanceof Number ? value.valueOf() : Number( value );
    return this.type.hasMember( member ) ? member : undefined;
  }

  /**
   * Checks if value is the defined enumeration and is not null.
   *
   * @function bo.dataTypes.Enum#hasValue
   * @param {*} value - The value to check.
   * @returns {boolean} True if the value is the defined enumeration and not null, otherwise false.
   */
  hasValue( value ) {

    const parsed = this.parse( value );
    return parsed !== undefined && parsed !== null;
  }
}

export default Enum;
