'use strict';

import Enumeration from '../system/enumeration.js';

/**
 * Represents the eligible actions when an
 * {@link bo.commonRules.ExpressionRule expression rule} is executed on a null value.
 *
 * @memberof bo.commonRules
 * @extends bo.system.Enumeration
 */
class NullResultOption extends Enumeration {

  /**
   * Creates a new object containing null result options.
   */
  constructor() {
    super();

    /**
     * The result of the rule will be success.
     * @constant {number} bo.commonRules.NullResultOption#returnTrue
     * @default 0
     */
    this.returnTrue = 0;
    /**
     * The result of the rule will be failure.
     * @constant {number} bo.commonRules.NullResultOption#returnFalse
     * @default 1
     */
    this.returnFalse = 1;
    /**
     * The value will be replaced by an empty string.
     * @constant {number} bo.commonRules.NullResultOption#convertToEmptyString
     * @default 2
     */
    this.convertToEmptyString = 2;

    // Immutable object.
    Object.freeze( this );
  }
}

export default new NullResultOption();
