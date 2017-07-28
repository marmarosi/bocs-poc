'use strict';

import DataType from './data-type.js';

/**
 * Provide methods to work with Integer data.
 *
 * @memberof bo.dataTypes
 * @extends bo.dataTypes.DataType
 */
class Integer extends DataType {

  /**
   * Creates Integer data type definition.
   */
  constructor() {
    super();

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if value is an Integer data.
   *
   * @function bo.dataTypes.Integer#parse
   * @param {*} [value] - The value to check.
   * @returns {*} The Integer value or null when the input value is valid, otherwise undefined.
   */
  parse( value ) {

    if (value === null)
      return value;
    if (value === undefined)
      return null;

    let integer;
    if (typeof value === 'number')
      integer = value;
    else if (value instanceof Number)
      integer = value.valueOf();
    else
      integer = new Number( value ).valueOf();

    return isNaN( integer ) || (integer % 1 !== 0) ? undefined : integer;
  }

  /**
   * Checks if value is an Integer data and is not null.
   *
   * @function bo.dataTypes.Integer#hasValue
   * @param {data} value - The value to check.
   * @returns {boolean} True if the value is Integer and not null, otherwise false.
   */
  hasValue( value ) {

    const parsed = this.parse( value );
    return parsed !== undefined && parsed !== null;
  }
}

export default Integer;
