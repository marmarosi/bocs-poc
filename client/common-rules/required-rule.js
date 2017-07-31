'use strict';

const t = require( '../locales/i18n-bo.js' )( 'Rules' );
import ValidationRule from '../rules/validation-rule.js';

/**
 * The rule ensures that the property value exists.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class RequiredRule extends ValidationRule {

  /**
   * Creates a new required rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=50] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, message, priority, stopsProcessing ) {
    super( 'Required' );

    // Initialize base properties.
    this.initialize(
      primaryProperty,
      message || t( 'required', primaryProperty ? primaryProperty.name : '' ),
      priority || 50,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the value of the property exists.
   *
   * @function bo.commonRules.RequiredRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    const value = inputs[ this.primaryProperty.name ];

    if (!this.primaryProperty.hasValue( value ))
      return this.result( this.message );
  }
}

export default RequiredRule;
