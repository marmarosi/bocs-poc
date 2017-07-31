'use strict';

//region Imports

const t = require( '../locales/i18n-bo.js' )( 'Rules' );
import Argument from '../system/argument-check.js';
import AuthorizationRule from '../rules/authorization-rule.js';
import UserInfo from '../system/user-info.js';

//endregion

/**
 * The rule ensures that the user is member of a role.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.AuthorizationRule
 */
class IsInRoleRule extends AuthorizationRule {

  /**
   * Creates a new is-in-role rule object.
   *
   * @param {bo.rules.AuthorizationAction} action - The action to be authorized.
   * @param {(bo.common.PropertyInfo|string|null)} [target] - Eventual parameter of the authorization action.
   * @param {string} role - The name of the role the user is member of.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=100] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a AuthorizationAction item.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be a PropertyInfo object in case of property read or write.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be a non-empty string in case of method execution.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be null in case of model actions.
   * @throws {@link bo.system.ArgumentError Argument error}: The role must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( action, target, role, message, priority, stopsProcessing ) {
    super( 'IsInRole' );

    /**
     * The name of the role the user is member of.
     * @member {string} bo.commonRules.IsInRoleRule#role
     * @readonly
     */
    this.role = Argument.inConstructor( IsInRoleRule.name )
      .check( role ).forMandatory( 'role' ).asString();

    // Initialize base properties.
    this.initialize(
      action,
      target,
      message || t( 'isInRole', role ),
      priority,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the  user is member of the defined role.
   *
   * @function bo.commonRules.IsInRoleRule#execute
   * @param {bo.system.UserInfo} userInfo - Information about the current user.
   * @returns {(bo.rules.AuthorizationResult|undefined)} Information about the failure.
   */
  execute( userInfo ) {

    userInfo = Argument.inMethod( IsInRoleRule.name, 'execute' )
      .check( userInfo ).forOptional( 'userInfo' ).asType( UserInfo );

    const hasPermission = userInfo.isInRole( this.role );

    if (!hasPermission)
      return this.result( this.message );
  }
}

export default IsInRoleRule;
