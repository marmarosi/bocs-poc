'use strict';

import DataType from './data-type.js';

/**
 * Provide methods to work with Text data.
 *
 * @memberof bo.dataTypes
 * @extends bo.dataTypes.DataType
 */
class Text extends DataType {

  /**
   * Creates Text data type definition.
   */
  constructor() {
    super();

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if value is a Text data.
   *
   * @function bo.dataTypes.Text#parse
   * @param {*} [value] - The value to check.
   * @returns {*} The Text value or null when the input value is valid, otherwise undefined.
   */
  parse( value ) {

    if (value === null || typeof value === 'string')
      return value;
    if (value === undefined)
      return null;
    if (value instanceof String)
      return value.valueOf();

    return new String( value ).valueOf();
  }

  /**
   * Checks if value is a Text data and is not null.
   *
   * @function bo.dataTypes.Text#hasValue
   * @param {data} value - The value to check.
   * @returns {boolean} True if the value is Text and not null, otherwise false.
   */
  hasValue( value ) {

    const parsed = this.parse( value );
    return parsed !== undefined && parsed !== null && parsed.length > 0;
  }
}

export default Text;
