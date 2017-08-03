'use strict';

//region Imports

import i18n from '../locales/i18n-bo.js';
import ValidationRule from './validation-rule.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the data type of the property value is valid.
 * This rule is used by the models internally to check the data types
 * of the properties.
 *
 * @memberof bo.rules
 * @extends bo.rules.ValidationRule
 */
class DataTypeRule extends ValidationRule {

  /**
   * Creates a new data type rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The primary property must be a PropertyInfo object.
   */
  constructor( primaryProperty ) {
    super( 'DataType' );

    // Initialize base properties.
    this.initialize(
      primaryProperty,
      t( 'dataType', primaryProperty.name, primaryProperty.type.name ),
      Number.MAX_VALUE,
      true
    );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Checks the validity of the property value.
   *
   * @function bo.rules.DataTypeRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {
    // Nothing to do.
  }
}

export default DataTypeRule;
