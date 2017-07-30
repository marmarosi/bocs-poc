'use strict';

import NotImplementedError from '../system/not-implemented-error.js';

/**
 * Serves as the base class for data type definitions.
 *
 * @memberof bo.dataTypes
 */
class DataType {

  /**
   * The name of the data type. The default value is the name of the constructor.
   * @member {string} bo.dataTypes.DataType#name
   * @readonly
   */
  get name() {
    return this.constructor.name;
  }

  /**
   * Abstract method to check if the value conforms to the data type definition.
   * Returns the value when it has the required data type. If not, but it can be
   * converted into the required data type, then returns the converted value.
   * Otherwise returns *undefined* to mark the value as invalid.
   *
   * @abstract
   * @function bo.dataTypes.DataType#isValid
   * @param {*} [value] - The value to check.
   * @returns {*} The value in the defined data type or null when the value is valid, otherwise undefined.
   *
   * @throws {@link bo.system.NotImplementedError Not implemented error}: The DataType.check method is not implemented.
   */
  parse( value ) {
    throw new NotImplementedError( 'method', this.name, 'parse' );
  }

  /**
   * Abstract method to check if the data type of the value conforms to the data type definition
   * and it is not null.
   *
   * @abstract
   * @function bo.dataTypes.DataType#hasValue
   * @param {*} value - The value to check.
   * @returns {boolean} True if the value is the defined data type and not null, otherwise false.
   *
   * @throws {@link bo.system.NotImplementedError Not implemented error}: The DataType.hasValue method is not implemented.
   */
  hasValue( value ) {
    throw new NotImplementedError( 'method', this.name, 'hasValue' );
  }
}

export default DataType;
