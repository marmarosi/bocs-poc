'use strict';

const t = require( '../locales/i18n-bo.js' )( 'Rules' );
import Argument from '../system/argument-check.js';
import BrokenRulesOutput from './broken-rules-output.js';

/**
 * Represents the HTTP Response format of broken rules. The data property
 * holds the information of broken rules.
 *
 * If the model property is a simple property, i.e. it is defined by
 * a {@link bo.dataTypes.DataType data type}, then the output property
 * is an array. The array elements are objects with a message and a
 * severity property, that represent the broken rules.
 *
 * If the model property is a child object, then the output property
 * is an object as well, whose properties represents model properties
 * with broken rules, as described above.
 *
 * If the model property is a child collection, then the output property
 * is an object as well, whose properties are the indeces of the items of
 * the collections. The property name is a number in '00000' format. The
 * property value represents the child item, as described above.
 *
 * @memberof bo.rules
 */
class BrokenRulesResponse {

  /**
   * Creates a new broken rules response instance.
   *
   * @param {bo.rules.BrokenRulesOutput} brokenRules - The broken rules to send to the client.
   * @param {string} [message] - Human-readable description of the reason of the failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The broken rules must be a BrokenRulesOutput object.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a string value.
   */
  constructor( brokenRules, message ) {
    const check = Argument.inConstructor( this.constructor.name );

    brokenRules = check( brokenRules ).forMandatory( 'brokenRules' ).asType( BrokenRulesOutput );

    /**
     * The name of the response object.
     * @member {string} bo.rules.BrokenRulesResponse#name
     * @default
     * @readonly
     */
    this.name = 'BrokenRules';

    /**
     * The status code of the HTTP response.
     * @member {number} bo.rules.BrokenRulesResponse#status
     * @default
     * @readonly
     */
    this.status = 422;

    /**
     * Human-readable description of the reason of the failure.
     * @member {string} bo.rules.BrokenRulesResponse#message
     * @readonly
     */
    this.message = check( message || t( 'invalid' ) ).for( 'message' ).asString();

    /**
     * The object of the broken rules.
     * @member {object} bo.rules.BrokenRulesResponse#data
     * @readonly
     */
    this.data = brokenRules;

    /**
     * The count of the broken rules.
     * @member {number} bo.rules.BrokenRulesResponse#count
     * @default
     * @read-only
     */
    this.count = brokenRules.$count;

    /**
     * The count of properties that have broken rules.
     * @member {number} bo.rules.BrokenRulesResponse#length
     * @default
     * @read-only
     */
    this.length = brokenRules.$length;

    // Immutable object.
    Object.freeze( this );
  }
}

export default BrokenRulesResponse;
