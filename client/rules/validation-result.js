'use strict';

import Argument from '../system/argument-check.js';
import ResultBase from './result-base.js';

/**
 * Represents the failed result of executing a validation rule.
 *
 * @memberof bo.rules
 * @extends bo.rules.ResultBase
 */
class ValidationResult extends ResultBase {

  /**
   * Creates a new validation rule result object.
   *
   * @param {string} ruleName - The name of the rule.
   * @param {string} propertyName - The name of the property the rule belongs to.
   * @param {string} message - Human-readable description of the reason of the failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The rule name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( ruleName, propertyName, message ) {
    super( ruleName, propertyName, message );

    propertyName = Argument.inConstructor( this.constructor.name )
      .check( propertyName ).forMandatory( 'propertyName' ).asString();

    /**
     * An array of properties that are affected by the rule.
     * @member {Array.<bo.common.PropertyInfo>} bo.rules.ValidationResult#affectedProperties
     * @readonly
     */
    this.affectedProperties = null;
  }
}

export default ValidationResult;
