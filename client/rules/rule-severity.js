'use strict';

import Enumeration from '../system/enumeration.js';

/**
 * Specifies the severity of a rule failure.
 *
 * @memberof bo.rules
 * @extends bo.system.Enumeration
 */
class RuleSeverity extends Enumeration {

  /**
   * Creates a new enumeration to define rule severity options.
   */
  constructor() {
    super();

    /**
     * The rule executed successfully.
     * @constant {number} bo.rules.RuleSeverity#success
     * @default 0
     */
    this.success = 0;
    /**
     * The broken rule represents information.
     * @constant {number} bo.rules.RuleSeverity#information
     * @default 1
     */
    this.information = 1;
    /**
     * The broken rule represents a warning.
     * @constant {number} bo.rules.RuleSeverity#warning
     * @default 2
     */
    this.warning = 2;
    /**
     * The broken rule represents an error.
     * @constant {number} bo.rules.RuleSeverity#error
     * @default 3
     */
    this.error = 3;

    // Immutable object.
    Object.freeze( this );
  }
}

export default new RuleSeverity();
