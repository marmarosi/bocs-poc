'use strict';

import DataType from './data-type.js';

const reEmail = /^(([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+)?$/;

/**
 * Provide methods to work with Email data.
 *
 * @memberof bo.dataTypes
 * @extends bo.dataTypes.DataType
 */
class Email extends DataType {

  /**
   * Creates Email data type definition.
   */
  constructor() {
    super();

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if value is an Email data.
   *
   * @function bo.dataTypes.Email#parse
   * @param {*} [value] - The value to check.
   * @returns {*} The Email value or null when the input value is valid, otherwise undefined.
   */
  parse( value ) {

    if (value === null)
      return value;
    if (value === undefined)
      return null;

    let email;
    if (typeof value === 'string')
      email = value;
    else if (value instanceof String)
      email = value.valueOf();
    else
      email = new String( value ).valueOf();

    return email.length && reEmail.test( email ) ? email : undefined;
  }

  /**
   * Checks if value is an Email data and is not null.
   *
   * @function bo.dataTypes.Email#hasValue
   * @param {data} value - The value to check.
   * @returns {boolean} True if the value is Email and not null, otherwise false.
   */
  hasValue( value ) {

    const parsed = this.parse( value );
    return parsed !== undefined && parsed !== null;
  }
}

export default Email;
