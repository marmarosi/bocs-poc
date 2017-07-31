'use strict';

import Argument from '../system/argument-check.js';
import ArgumentError from '../system/argument-error.js';
import ConstructorError from '../system/constructor-error.js';
import NotImplementedError from '../system/not-implemented-error.js';

/**
 * Serves as the base class for rules.
 *
 * @memberof bo.rules
 */
class RuleBase {

  /**
   * Creates a new rule object.
   * The rule instances should be frozen.
   *
   * @param {string} ruleName - The name of the rule.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The rule name must be a non-empty string.
   */
  constructor( ruleName ) {

    ruleName = Argument.inConstructor( this.constructor.name )
      .check( ruleName ).forMandatory( 'ruleName' ).asString();

    /**
     * The name of the rule type.
     * The default value usually the name of the constructor, without the Rule suffix.
     * @member {string} bo.rules.RuleBase#ruleName
     * @readonly
     */
    Object.defineProperty( this, 'ruleName', {
      get: function () {
        return ruleName;
      },
      enumeration: true
    } );

    /**
     * Human-readable description of the rule failure.
     * @member {string} bo.rules.RuleBase#message
     * @readonly
     */
    this.message = null;
    /**
     * The priority of the rule. Higher number means higher priority.
     * @member {number} bo.rules.RuleBase#priority
     * @default
     * @readonly
     */
    this.priority = 10;
    /**
     * Indicates whether processing of the rules for a property stops when the rule fails.
     * @member {boolean} bo.rules.RuleBase#stopsProcessing
     * @default
     * @readonly
     */
    this.stopsProcessing = false;
  }

  /**
   * Sets the properties of the rule.
   *
   * @function bo.rules.RuleBase#initialize
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The last 3 arguments can be:
   *    a string as the message, an integer as the priority and a Boolean as the stopsProcessing argument.
   */
  initialize( message, priority, stopsProcessing ) {

    // Remove null and undefined arguments.
    const args = Array.prototype.slice.call( arguments ).filter( function ( arg ) {
      return arg !== null && arg !== undefined;
    } );

    if (args.length) {
      for (let i = 0; i < args.length; i++) {
        switch (typeof args[ i ]) {
          case 'string':
            this.message = args[ i ];
            break;
          case 'number':
            this.priority = Math.round( args[ i ] );
            break;
          case 'boolean':
            this.stopsProcessing = args[ i ];
            break;
          default:
            throw new ConstructorError( 'rule', this.constructor.name );
        }
      }
    }
    Argument.inConstructor( this.constructor.name ).check( this.message ).forMandatory( 'message' ).asString();
  }

  /**
   * Abstract method to check if the rule is valid for the property.
   *
   * @abstract
   * @function bo.rules.RuleBase#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   *
   * @throws {@link bo.system.NotImplementedError Not implemented error}: The Rule.execute method is not implemented.
   */
  execute( inputs ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'execute' );
  }

  /**
   * Abstract method that returns the result of the rule checking.
   *
   * @abstract
   * @function bo.rules.RuleBase#result
   * @param {string} [message] - Human-readable description of the rule failure.
   * @param {bo.rules.RuleSeverity} [severity] - The severity of the rule failure.
   * @returns {object} An object that describes the result of the rule checking.
   *
   * @throws {@link bo.system.NotImplementedError Not implemented error}: The Rule.result method is not implemented.
   */
  result( message, severity ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'result' );
  }
}

export default RuleBase;
