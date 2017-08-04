'use strict';

//region Imports

import i18n from '../system/i18n-bo.js';
import Argument from '../system/argument-check.js';
import ValidationRule from '../rules/validation-rule.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the length of the property value does not exceed a given length.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class MaxLengthRule extends ValidationRule {

  /**
   * Creates a new max-length rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {number} maxLength - The maximum length of the property value.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The maximum length must be an integer value.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, maxLength, message, priority, stopsProcessing ) {
    super( 'MaxLength' );

    /**
     * The maximum length of the property value.
     * @member {number} bo.commonRules.MaxLengthRule#maxLength
     * @readonly
     */
    this.maxLength = Argument.inConstructor( MaxLengthRule.name )
      .check( maxLength ).forMandatory( 'maxLength' ).asInteger();

    // Initialize base properties.
    const propertyName = primaryProperty ? primaryProperty.name : '';
    this.initialize(
      primaryProperty,
      message || (maxLength > 1 ?
      t( 'maxLength', propertyName, maxLength ) :
      t( 'maxLength1', propertyName )),
      priority,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the length of the property value does not exceed the defined length.
   *
   * @function bo.commonRules.MaxLengthRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    const value = inputs[ this.primaryProperty.name ];

    if (value && value.toString().length > this.maxLength)
      return this.result( this.message );
  }
}

export default MaxLengthRule;
