'use strict';

//region Imports

import i18n from '../locales/i18n-bo.js';
import Argument from '../system/argument-check.js';
import ValidationRule from '../rules/validation-rule.js';
import NullResultOption from './null-result-option.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the property value matches a regular expression.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class ExpressionRule extends ValidationRule {

  /**
   * Creates a new expression rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {RegExp} regex - The regular expression that specifies the rule.
   * @param {bo.commonRules.NullResultOption} option - The action to execute when the value is null.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The regular expression must be a RegExp object.
   * @throws {@link bo.system.ArgumentError Argument error}: The option must be a NullResultOption item.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, regex, option, message, priority, stopsProcessing ) {
    super( 'Expression' );
    const check = Argument.inConstructor( ExpressionRule.name );

    /**
     * The regular expression that the property value has to conform.
     * @member {RegExp} bo.commonRules.ExpressionRule#regex
     * @readonly
     */
    this.regex = check( regex ).forMandatory( 'regex' ).asType( RegExp );

    /**
     * The action to execute when the value of the property is null.
     * @member {bo.commonRules.NullResultOption} bo.commonRules.ExpressionRule#option
     * @readonly
     */
    this.option = check( option ).for( 'option' ).asEnumMember( NullResultOption, null );

    // Initialize base properties.
    this.initialize(
      primaryProperty,
      message || t( 'expression', primaryProperty ? primaryProperty.name : '' ),
      priority,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the value of the property matches the regular expression.
   *
   * @function bo.commonRules.ExpressionRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    let value = inputs[ this.primaryProperty.name ];
    let ruleIsSatisfied = false;

    if (value === null && this.option === NullResultOption.convertToEmptyString) {
      value = '';
    }
    if (value === null) {
      // If the value is null at this point,
      // then return the pre-defined result value.
      ruleIsSatisfied = (this.option === NullResultOption.returnTrue);
    }
    else {
      // The value is not null, so run the regular expression
      ruleIsSatisfied = this.regex.test( value.toString() );
    }

    if (!ruleIsSatisfied)
      return this.result( this.message );
  }
}

export default ExpressionRule;
