'use strict';

//region Imports

import i18n from '../system/i18n-bo.js';
import Argument from '../system/argument-check.js';
import AuthorizationRule from '../rules/authorization-rule.js';
import UserInfo from '../system/user-info.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the user is member of a role from a group.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.AuthorizationRule
 */
class IsInAnyRoleRule extends AuthorizationRule {

  /**
   * Creates a new is-in-any-role rule object.
   *
   * @param {bo.rules.AuthorizationAction} action - The action to be authorized.
   * @param {(bo.common.PropertyInfo|string|null)} [target] - Eventual parameter of the authorization action.
   * @param {Array.<string>} roles - The names of the roles the user can be member of.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=100] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The action must be a AuthorizationAction item.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be a PropertyInfo object in case of property read or write.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be a non-empty string in case of method execution.
   * @throws {@link bo.system.ArgumentError Argument error}: The target must be null in case of model actions.
   * @throws {@link bo.system.ArgumentError Argument error}: The roles must be an array of string values.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( action, target, roles, message, priority, stopsProcessing ) {
    super( 'IsInAnyRole' );

    /**
     * The names of the roles the user can be member of.
     * @member {Array.<string>} bo.commonRules.IsInAnyRoleRule#roles
     * @readonly
     */
    this.roles = Argument.inConstructor( IsInAnyRoleRule.name )
      .check( roles ).forMandatory( 'roles' ).asArray( String );

    // Initialize base properties.
    this.initialize(
      action,
      target,
      message || t( 'isInAnyRole', roles.join( ', ' ) ),
      priority,
      stopsProcessing
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks if the  user is member of a role from the defined group.
   *
   * @function bo.commonRules.IsInAnyRoleRule#execute
   * @param {bo.system.UserInfo} userInfo - Information about the current user.
   * @returns {(bo.rules.AuthorizationResult|undefined)} Information about the failure.
   */
  execute( userInfo ) {

    userInfo = Argument.inMethod( IsInAnyRoleRule.name, 'execute' )
      .check( userInfo ).forOptional( 'userInfo' ).asType( UserInfo );

    let hasPermission = false;

    if (userInfo) {
      if (this.roles.length > 0) {
        for (let i = 0; i < this.roles.length; i++) {
          const role = this.roles[ i ];
          if (userInfo.isInRole( role )) {
            hasPermission = true;
            break;
          }
        }
      } else
        hasPermission = true;
    } else
      hasPermission = this.roles.length === 0;

    if (!hasPermission)
      return this.result( this.message );
  }
}

export default IsInAnyRoleRule;
