'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import RuleSeverity from './rule-severity.js';

//endregion

/**
 * Represents the public turnout of a failed rule.
 *
 * @memberof bo.rules
 */
class BrokenRule {

  /**
   * Creates a new broken rule instance.
   *
   * @param {string} ruleName - The name of the failed rule.
   * @param {boolean} isPreserved - Indicates whether the broken rule of this failure
   *      is preserved when a new verification starts.
   * @param {string} [propertyName] - The name of the property the rule belongs to.
   * @param {string} message - Human-readable description of the reason of the failure.
   * @param {bo.rules.RuleSeverity} severity - The severity of the rule failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The rule name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The preservation flag must be a Boolean value.
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a string.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The severity must be a RuleSeverity item.
   */
  constructor( ruleName, isPreserved, propertyName, message, severity ) {
    const check = Argument.inConstructor( this.constructor.name );

    /**
     * The name of the failed rule.
     * @member {string} bo.rules.BrokenRule#ruleName
     */
    this.ruleName = check( ruleName ).forMandatory( 'ruleName' ).asString();

    /**
     * Indicates whether the broken rule is preserved when a new verification starts.
     * @member {boolean} bo.rules.BrokenRule#isPreserved
     */
    this.isPreserved = check( isPreserved || false ).forMandatory( 'isPreserved' ).asBoolean();

    /**
     * The name of the property the failed rule belongs to.
     * @member {string} bo.rules.BrokenRule#propertyName
     */
    this.propertyName = check( propertyName || '' ).for( 'propertyName' ).asString();

    /**
     * Human-readable description of the reason of the failure.
     * @member {string} bo.rules.BrokenRule#message
     */
    this.message = check( message ).forMandatory( 'message' ).asString();

    /**
     * The severity of the rule failure.
     * @member {bo.rules.RuleSeverity} bo.rules.BrokenRule#severity
     */
    this.severity = check( severity ).for( 'severity' ).asEnumMember( RuleSeverity, RuleSeverity.error );
  }
}

export default BrokenRule;
