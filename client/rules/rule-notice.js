'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import RuleSeverity from './rule-severity.js';

//endregion

/**
 * Represents the public information of a failed rule.
 *
 * @memberof bo.rules
 */
class RuleNotice {

  /**
   * Creates a new rule notice instance.
   *
   * @param {string} message - Human-readable description of the reason of the failure.
   * @param {bo.rules.RuleSeverity} [severity] - The severity of the rule failure, defaults to error.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The severity must be a RuleSeverity item.
   */
  constructor( message, severity ) {
    const check = Argument.inConstructor( this.constructor.name );

    /**
     * Human-readable description of the reason of rule failure.
     * @member {string} bo.rules.RuleNotice#message
     * @readonly
     */
    this.message = check( message ).forMandatory( 'message' ).asString();

    /**
     * The severity of the rule failure.
     * @member {bo.rules.RuleSeverity} bo.rules.RuleNotice#severity
     * @readonly
     */
    this.severity = check( severity ).for( 'severity' ).asEnumMember( RuleSeverity, RuleSeverity.error );

    // Immutable object.
    Object.freeze( this );
  }
}

export default RuleNotice;
