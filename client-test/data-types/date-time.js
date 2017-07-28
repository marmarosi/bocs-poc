'use strict';

import DataType from './data-type.js';

/**
 * Provide methods to work with DateTime data.
 *
 * @memberof bo.dataTypes
 * @extends bo.dataTypes.DataType
 */
class DateTime extends DataType {

  /**
   * Creates DateTime data type definition.
   */
  constructor() {
    super();

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if value is a DateTime data.
   *
   * @function bo.dataTypes.DateTime#parse
   * @param {*} [value] - The value to check.
   * @returns {*} The DateTime value or null when the input value is valid, otherwise undefined.
   */
  parse( value ) {

    if (value === null)
      return value;
    if (value === undefined)
      return null;

    const datetime = value instanceof Date ? value : new Date( value );
    return isNaN( datetime.valueOf() ) ? undefined : datetime;
  }

  /**
   * Checks if value is a DateTime data and is not null.
   *
   * @function bo.dataTypes.DateTime#hasValue
   * @param {data} value - The value to check.
   * @returns {boolean} True if the value is DateTime and not null, otherwise false.
   */
  hasValue( value ) {

    const parsed = this.parse( value );
    return parsed !== undefined && parsed !== null;
  }
}

export default DateTime;
