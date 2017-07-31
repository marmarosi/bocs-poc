'use strict';

import Enumeration from '../system/enumeration.js';

/**
 * Specifies the behavior when an authorization rule fails. Members:
 *
 *    * throwError
 *    * showError
 *    * showWarning
 *    * showInformation
 *
 * @memberof bo.rules
 * @extends bo.system.Enumeration
 */
class NoAccessBehavior extends Enumeration {

  /**
   * Creates a new enumeration to define the behavior of unauthorized actions.
   */
  constructor() {
    super();

    /**
     * The rule throws an {@link bo.rules.AuthorizationError authorization error}.
     * @constant {number} bo.rules.NoAccessBehavior#throwError
     * @default 0
     */
    this.throwError = 0;
    /**
     * The result of the rule is a broken rule with {@link bo.rules.RuleSeverity#error error severity}.
     * @constant {number} bo.rules.NoAccessBehavior#showError
     * @default 1
     */
    this.showError = 1;
    /**
     * The result of the rule is a broken rule with {@link bo.rules.RuleSeverity#warning warning severity}.
     * @constant {number} bo.rules.NoAccessBehavior#showWarning
     * @default 2
     */
    this.showWarning = 2;
    /**
     * The result of the rule is a broken rule with {@link bo.rules.RuleSeverity#information information severity}.
     * @constant {number} bo.rules.NoAccessBehavior#showInformation
     * @default 3
     */
    this.showInformation = 3;

    // Immutable object.
    Object.freeze( this );
  }
}

export default new NoAccessBehavior();
