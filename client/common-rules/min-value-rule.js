'use strict';

//region Imports

import i18n from '../locales/i18n-bo.js';
import Argument from '../system/argument-check.js';
import ValidationRule from '../rules/validation-rule.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the value of the property reaches a given value.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class MinValueRule extends ValidationRule {

  /**
   * Creates a new min-value rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {number} minValue - The minimum value of the property.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The minimum value is required.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, minValue, message, priority, stopsProcessing ) {
    super( 'MinValue' );

    /**
     * The minimum value of the property.
     * @member {number} bo.commonRules.MinValueRule#minValue
     * @readonly
     */
    this.minValue = Argument.inConstructor( MinValueRule.name )
      .check( minValue ).forMandatory( 'minValue' ).hasValue();

    // Initialize base properties.
    this.initialize(
      primaryProperty,
      message || t( 'minValue', primaryProperty ? primaryProperty.name : '', minValue ),
      priority,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the value of the property reaches the defined value.
   *
   * @function bo.commonRules.MinValueRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    const value = inputs[ this.primaryProperty.name ];

    if (!value || value < this.minValue)
      return this.result( this.message );
  }
}

export default MinValueRule;
