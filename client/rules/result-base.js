'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import BrokenRule from './broken-rule.js';
import RuleSeverity from './rule-severity.js';

//endregion

/**
 * Serves as the base class for the failed result of executing a rule.
 *
 * @memberof bo.rules
 */
class ResultBase {

  /**
   * Creates a new rule result object.
   *
   * @param {string} ruleName - The name of the rule.
   * @param {string} propertyName - The name of the property the rule belongs to.
   * @param {string} message - Human-readable description of the reason of the failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The rule name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( ruleName, propertyName, message ) {
    const check = Argument.inConstructor( this.constructor.name );

    /**
     * The name of the rule.
     * @member {string} bo.rules.ResultBase#ruleName
     * @readonly
     */
    this.ruleName = check( ruleName ).forMandatory( 'ruleName' ).asString();

    /**
     * The name of the property the rule belongs to.
     * @member {string} bo.rules.ResultBase#propertyName
     * @readonly
     */
    this.propertyName = propertyName || '';

    /**
     * Human-readable description of the reason of the failure.
     * @member {string} bo.rules.ResultBase#message
     * @readonly
     */
    this.message = check( message ).forMandatory( 'message' ).asString();

    /**
     * The severity of the rule failure.
     * @member {bo.rules.RuleSeverity} bo.rules.ResultBase#severity
     * @readonly
     */
    this.severity = RuleSeverity.error;

    /**
     * Indicates whether processing the rules of the property should stop.
     * @member {boolean} bo.rules.ResultBase#stopsProcessing
     * @readonly
     */
    this.stopsProcessing = false;

    /**
     * Indicates whether the broken rule of this failure is preserved when a new verification starts.
     * Typically the broken rules of authorization rules are retained.
     * @member {boolean} bo.rules.ResultBase#isPreserved
     * @readonly
     */
    this.isPreserved = false;
  }

  /**
   * Maps the rule result to broken rule.
   *
   * @function bo.rules.ResultBase#toBrokenRule
   * @returns {bo.rules.BrokenRule} The broken rule companion of the rule result.
   */
  toBrokenRule() {
    return new BrokenRule(
      this.ruleName,
      this.isPreserved,
      this.propertyName,
      this.message,
      this.severity
    );
  }
}

export default ResultBase;
