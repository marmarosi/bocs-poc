'use strict';

//region Imports

import ValidationRule from './validation-rule.js';
import ValidationContext from './validation-context.js';
import ValidationResult from './validation-result.js';
import DataTypeRule from './data-type-rule.js';

import AuthorizationRule from './authorization-rule.js';
import AuthorizationContext from './authorization-context.js';
import AuthorizationResult from './authorization-result.js';
import AuthorizationError from './authorization-error.js';
import AuthorizationAction from './authorization-action.js';
import NoAccessBehavior from './no-access-behavior.js';

import RuleManager from './rule-manager.js';
import RuleList from './rule-list.js';
import RuleSeverity from './rule-severity.js';
import RuleBase from './rule-base.js';
import ResultBase from './result-base.js';

import BrokenRule from './broken-rule.js';
import BrokenRuleList from './broken-rule-list.js';
import RuleNotice from './rule-notice.js';
import BrokenRulesOutput from './broken-rules-output.js';
import BrokenRulesResponse from './broken-rules-response.js';

//endregion

/**
 * Contains components used by authorization and validation rules.
 *
 * @namespace bo.rules
 *
 * @property {function} ValidationRule - {@link bo.rules.ValidationRule Validation rule}
 *      constructor creates a new validation rule instance.
 * @property {function} ValidationContext - {@link bo.rules.ValidationContext Validation context}
 *      constructor creates a new validation context instance.
 * @property {function} ValidationResult - {@link bo.rules.ValidationResult Validation result}
 *      constructor creates a new validation result instance.
 * @property {function} DataTypeRule - {@link bo.rules.DataTypeRule Data type rule}
 *      constructor creates a new data type rule instance.
 *
 * @property {function} AuthorizationRule - {@link bo.rules.AuthorizationRule Authorization rule}
 *      constructor creates a new authorization rule instance.
 * @property {function} AuthorizationContext - {@link bo.rules.AuthorizationContext Authorization context}
 *      constructor creates a new authorization context instance.
 * @property {function} AuthorizationResult - {@link bo.rules.AuthorizationResult Authorization result}
 *      constructor creates a new authorization result instance.
 * @property {function} AuthorizationError - {@link bo.rules.AuthorizationError Authorization error}
 *      constructor creates a new error related to a broken authorization rule.
 * @property {object} AuthorizationAction - {@link bo.rules.AuthorizationAction Authorization action}
 *      object specifies the operations of models to authorize.
 * @property {object} NoAccessBehavior - {@link bo.rules.NoAccessBehavior No access behavior}
 *      object specifies the behavior options of failed authorization rules.
 *
 * @property {function} RuleManager - {@link bo.rules.RuleManager Rule manager}
 *      constructor creates a new manager instance.
 * @property {function} RuleList - {@link bo.rules.RuleList Rule list}
 *      constructor creates a new rule list instance.
 * @property {object} RuleSeverity - {@link bo.rules.RuleSeverity Rule severity}
 *      object specifies the severity options of rule failures.
 * @property {function} RuleBase - {@link bo.rules.RuleBase Base rule}
 *      constructor creates a new base rule instance.
 * @property {function} ResultBase - {@link bo.rules.ResultBase Base rule result}
 *      constructor creates a new base rule result instance.
 *
 * @property {function} BrokenRule - {@link bo.rules.BrokenRule Broken rule}
 *      constructor creates a new broken rule instance.
 * @property {function} BrokenRuleList - {@link bo.rules.BrokenRuleList Broken rule list}
 *      constructor creates a new broken rule list instance.
 * @property {function} RuleNotice - {@link bo.rules.RuleNotice Rule notice}
 *      constructor creates a new rule notice instance.
 * @property {function} BrokenRulesOutput - {@link bo.rules.BrokenRulesOutput Broken rules output}
 *      constructor creates a new object instance holding the broken rule information.
 * @property {function} BrokenRulesResponse - {@link bo.rules.BrokenRulesResponse Validation response}
 *      constructor creates a new broken rules response instance.
 */
const index = {
  ValidationRule: ValidationRule,
  ValidationContext: ValidationContext,
  ValidationResult: ValidationResult,
  DataTypeRule: DataTypeRule,

  AuthorizationRule: AuthorizationRule,
  AuthorizationContext: AuthorizationContext,
  AuthorizationResult: AuthorizationResult,
  AuthorizationError: AuthorizationError,
  AuthorizationAction: AuthorizationAction,
  NoAccessBehavior: NoAccessBehavior,

  RuleManager: RuleManager,
  RuleList: RuleList,
  RuleSeverity: RuleSeverity,
  RuleBase: RuleBase,
  ResultBase: ResultBase,

  BrokenRule: BrokenRule,
  BrokenRuleList: BrokenRuleList,
  RuleNotice: RuleNotice,
  BrokenRulesOutput: BrokenRulesOutput,
  BrokenRulesResponse: BrokenRulesResponse
};

// Immutable object.
Object.freeze( index );

export default index;
