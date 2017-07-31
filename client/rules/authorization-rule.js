'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import ArgumentError from '../system/argument-error.js';
import PropertyInfo from '../common/property-info.js';
import RuleBase from './rule-base.js';
import RuleSeverity from './rule-severity.js';
import AuthorizationAction from './authorization-action.js';
import AuthorizationResult from './authorization-result.js';
import AuthorizationError from './authorization-error.js';
import NoAccessBehavior from './no-access-behavior.js';

//endregion

//region Private variables

const _noAccessBehavior = new WeakMap();
const _propertyName = new WeakMap();

//endregion

//region Helper methods

function behaviorToSeverity( noAccessBehavior ) {
  switch (noAccessBehavior) {
    case NoAccessBehavior.showInformation:
      return RuleSeverity.information;
    case NoAccessBehavior.showWarning:
      return RuleSeverity.warning;
    default:
      return RuleSeverity.error;
  }
}

//endregion

/**
 * Represents an authorization rule.
 *
 * @memberof bo.rules
 * @extends bo.rules.RuleBase
 */
class AuthorizationRule extends RuleBase {

  //region Constructor

  /**
   * Creates a new authorization rule object.
   * The rule instances should be frozen.
   *
   * @param {string} ruleName - The name of the rule.
   *    It is typically the name of the constructor, without the Rule suffix.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The rule name must be a non-empty string.
   */
  constructor( ruleName ) {
    super( ruleName );

    /**
     * The identifier of the authorization action. Generally it is the action value,
     * or when target is not empty, the action value and the target name separated by
     * a dot, respectively.
     * @member {string} bo.rules.AuthorizationRule#ruleId
     * @readonly
     */
    this.ruleId = null;

    // Initialize the action executed on unauthorized access.
    _noAccessBehavior.set( this, NoAccessBehavior.throwError );
    _propertyName.set( this, '' );

    // Immutable object.
    Object.freeze( AuthorizationRule );
  }

  //endregion

  //region Properties

  /**
   * The action to do when the rule fails.
   * @member {bo.rules.NoAccessBehavior} bo.rules.AuthorizationRule#noAccessBehavior
   */
  get noAccessBehavior() {
    return _noAccessBehavior.get( this );
  }

  set noAccessBehavior( value ) {
    value = Argument.inProperty( this.constructor.name, 'noAccessBehavior' )
      .check( value ).for().asEnumMember( NoAccessBehavior, null );
    _noAccessBehavior.set( this, value );
  }

  //endregion

  //region Methods

  /**
   * Sets the properties of the rule.
   *
   * @param {bo.rules.AuthorizationAction} action - The action to be authorized.
   * @param {(bo.common.PropertyInfo|string|null)} [target] - Eventual parameter of the authorization action.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=100] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a AuthorizationAction item.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be a PropertyInfo object in case of property read or write.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be a non-empty string in case of method execution.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be null in case of model actions.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  initialize( action, target, message, priority, stopsProcessing ) {
    const check = Argument.inMethod( this.constructor.name, 'initialize' );

    action = check( action ).for( 'action' ).asEnumMember( AuthorizationAction, null );
    this.ruleId = AuthorizationAction.getName( action );

    if (action === AuthorizationAction.readProperty || action === AuthorizationAction.writeProperty) {

      target = check( target ).forMandatory( 'target' ).asType( PropertyInfo );
      _propertyName.set( this,  target.name );
      this.ruleId += '.' + target.name;
    }
    else if (action === AuthorizationAction.executeMethod) {

      target = check( target ).forMandatory( 'target' ).asString();
      this.ruleId += '.' + target;
    }
    else {
      if (target !== null)
        throw new ArgumentError( 'm_null', this.constructor.name, 'initialize', 'target' );
    }

    // Initialize base properties.
    RuleBase.prototype.initialize.call( this, message, priority || 100, stopsProcessing );
  }

  /**
   * Returns the result of the rule executed.
   * If the rule fails and the noAccessBehavior property is
   * {@link bo.rules.NoAccessBehavior#throwError}, throws an authorization error.
   *
   * @param {string} [message] - Human-readable description of the rule failure.
   * @param {bo.rules.RuleSeverity} severity - The severity of the failed rule.
   * @returns {bo.rules.AuthorizationResult} The result of the authorization rule.
   *
   * @throws {@link bo.common.AuthorizationError Authorization error}: The user has no permission to execute the action.
   */
  result( message, severity ) {

    if (this.noAccessBehavior === NoAccessBehavior.throwError) {
      throw new AuthorizationError( message || this.message );
    }
    else {
      const result = new AuthorizationResult(
        this.ruleName,
        _propertyName.get( this ),
        message || this.message
      );
      result.severity = severity || behaviorToSeverity( this.noAccessBehavior );
      result.stopsProcessing = this.stopsProcessing;
      result.isPreserved = true;
      return result;
    }
  }

  //endregion
}

export default AuthorizationRule;
