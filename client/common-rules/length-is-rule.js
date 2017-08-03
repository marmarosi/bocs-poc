'use strict';

//region Imports

import i18n from '../locales/i18n-bo.js';
import Argument from '../system/argument-check.js';
import ValidationRule from '../rules/validation-rule.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the length of the property value has a given length.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class LengthIsRule extends ValidationRule {

  /**
   * Creates a new length-is rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {number} length - The required length of the property value.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The length must be an integer value.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, length, message, priority, stopsProcessing ) {
    super( 'LengthIs' );

    /**
     * The required length of the property value.
     * @member {number} bo.commonRules.LengthIsRule#length
     * @readonly
     */
    this.length = Argument.inConstructor( LengthIsRule.name )
      .check( length ).forMandatory( 'length' ).asInteger();

    // Initialize base properties.
    const propertyName = primaryProperty ? primaryProperty.name : '';
    this.initialize(
      primaryProperty,
      message || (length > 1 ?
      t( 'lengthIs', propertyName, length ) :
      t( 'lengthIs1', propertyName )),
      priority,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the length of the property value equals to the defined length.
   *
   * @function bo.commonRules.LengthIsRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    const value = inputs[ this.primaryProperty.name ];

    if (!value || value.toString().length !== this.length)
      return this.result( this.message );
  }
}

export default LengthIsRule;
