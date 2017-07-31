'use strict';

import Argument from '../system/argument-check.js';
import ValidationRule from '../rules/validation-rule.js';
import RuleSeverity from '../rules/rule-severity.js';

/**
 * The rule ensures that an information is given for the property.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class InformationRule extends ValidationRule {

  /**
   * Creates a new information rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {string} message - The information to display.
   * @param {number} [priority=1] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, message, priority, stopsProcessing ) {
    super( 'Information' );

    Argument.inConstructor( this.constructor.name )
      .check( message ).forMandatory( 'message' ).asString();

    // Initialize base properties.
    this.initialize(
      primaryProperty,
      message,
      priority || 1,
      stopsProcessing || false
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Ensures that the information for the property is always present.
   *
   * @function bo.commonRules.InformationRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    return this.result( this.message, RuleSeverity.information );
  }
}

export default InformationRule;
