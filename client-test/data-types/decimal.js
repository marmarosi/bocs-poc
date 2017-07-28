'use strict';

import DataType from './data-type.js';

/**
 * Provide methods to work with Text data.
 *
 * @memberof bo.dataTypes
 * @extends bo.dataTypes.DataType
 */
class Decimal extends DataType {

  /**
   * Creates Text data type definition.
   */
  constructor() {
    super();

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if value is a Decimal data.
   *
   * @function bo.dataTypes.Decimal#parse
   * @param {*} [value] - The value to check.
   * @returns {*} The Decimal value or null when the input value is valid, otherwise undefined.
   */
  parse(value) {

    if (value === null || typeof value === 'number')
      return value;
    if (value === undefined)
      return null;

    const number = value instanceof Number ? value.valueOf() : Number(value);
    return isNaN(number) ? undefined : number;
  }

  /**
   * Checks if value is a Decimal data and is not null.
   *
   * @function bo.dataTypes.Decimal#hasValue
   * @param {data} value - The value to check.
   * @returns {boolean} True if the value is Decimal and not null, otherwise false.
   */
  hasValue(value) {

    const parsed = this.parse(value);
    return parsed !== undefined && parsed !== null;
  }
}

export default Decimal;
