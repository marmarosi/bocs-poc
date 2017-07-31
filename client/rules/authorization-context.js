'use strict';

//region Imports

import config from '../system/configuration.js';
import Argument from '../system/argument-check.js';
import BrokenRuleList from './broken-rule-list.js';
import AuthorizationAction from './authorization-action.js';

//endregion

/**
 * Provides the context for custom authorization rules.
 *
 * @memberof bo.rules
 */
class AuthorizationContext {

  /**
   * Creates a new authorization context object.
   *   </br></br>
   * <i><b>Warning:</b> Authorization context objects are created in models internally.
   * They are intended only to make publicly available the context
   * for custom authorization rules.</i>
   *
   * @param {bo.rules.AuthorizationAction} action - The operation to authorize.
   * @param {string} [targetName] - Eventual parameter of the authorization action.
   * @param {bo.rules.BrokenRuleList} brokenRules - The list of the broken rules.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be an AuthorizationAction item.
   * @throws {@link bo.system.ArgumentError Argument error}: The target name must be a string value.
   * @throws {@link bo.system.ArgumentError Argument error}: The broken rules must be a BrokenRuleList object.
   */
  constructor( action, targetName, brokenRules ) {
    const check = Argument.inConstructor( this.constructor.name );

    action = check( action ).for( 'action' ).asEnumMember( AuthorizationAction, null );
    targetName = check( targetName ).for( 'targetName' ).asString();

    /**
     * The list of the broken rules.
     * @member {bo.rules.BrokenRuleList} bo.rules.AuthorizationContext#brokenRules
     * @readonly
     */
    this.brokenRules = check( brokenRules ).forMandatory( 'brokenRules' ).asType( BrokenRuleList );

    /**
     * The identifier of the authorization action. Generally it is the action value,
     * or when target is not empty, the action value and the target name separated by
     * a dot, respectively.
     * @member {string} bo.rules.AuthorizationContext#ruleId
     * @readonly
     */
    this.ruleId = AuthorizationAction.getName( action );
    if (targetName)
      this.ruleId += '.' + targetName;

    /**
     * The current user.
     * @member {bo.system.UserInfo} bo.rules.AuthorizationContext#user
     * @readonly
     */
    this.user = config.getUser();
    /**
     * The current locale.
     * @member {string} bo.rules.AuthorizationContext#locale
     * @readonly
     */
    this.locale = config.getLocale();

    // Immutable object.
    Object.freeze( this );
  }
}

export default AuthorizationContext;
