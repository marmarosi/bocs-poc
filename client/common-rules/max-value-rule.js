'use strict';

//region Imports

import i18n from '../locales/i18n-bo.js';
import Argument from '../system/argument-check.js';
import ValidationRule from '../rules/validation-rule.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the value of the property does not exceed a given value.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class MaxValueRule extends ValidationRule {

  /**
   * Creates a new max-value rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {number} maxValue - The maximum value of the property.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The maximum value is required.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, maxValue, message, priority, stopsProcessing ) {
    super( 'MaxValue' );

    /**
     * The maximum value of the property.
     * @member {number} bo.commonRules.MaxValueRule#maxValue
     * @readonly
     */
    this.maxValue = Argument.inConstructor( MaxValueRule.name )
      .check( maxValue ).for( 'maxValue' ).hasValue();

    // Initialize base properties.
    this.initialize(
      primaryProperty,
      message || t( 'maxValue', primaryProperty ? primaryProperty.name : '', maxValue ),
      priority,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the value of the property does not exceed the defined value.
   *
   * @abstract
   * @function bo.commonRules.MaxValueRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    const value = inputs[ this.primaryProperty.name ];

    if (value && value > this.maxValue)
      return this.result( this.message );
  }
}

export default MaxValueRule;
