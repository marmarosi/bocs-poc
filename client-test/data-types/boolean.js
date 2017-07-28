'use strict';

import DataType from './data-type.js';

/**
 * Provide methods to work with Boolean data.
 *
 * @memberof bo.dataTypes
 * @extends bo.dataTypes.DataType
 */
class Boolean extends DataType {

  /**
   * Creates Boolean data type definition.
   */
  constructor() {
    super();

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if value is a Boolean data.
   *
   * @function bo.dataTypes.Boolean#parse
   * @param {*} [value] - The value to check.
   * @returns {*} The Boolean value or null when the input value is valid, otherwise undefined.
   */
  parse( value ) {

    if (value === null || typeof value === 'boolean')
      return value;
    if (value === undefined)
      return null;
    if (value instanceof Boolean)
      return value.valueOf();
    if (value.toString().trim().toLowerCase() === 'false')
      return false;

    return global.Boolean( value ).valueOf();
  }

  /**
   * Checks if value is a Boolean data and is not null.
   *
   * @function bo.dataTypes.Boolean#hasValue
   * @param {data} value - The value to check.
   * @returns {boolean} True if the value is Boolean and not null, otherwise false.
   */
  hasValue( value ) {

    const parsed = this.parse( value );
    return parsed !== undefined && parsed !== null;
  }
}

export default Boolean;
