'use strict';

//region Imports

import i18n from '../system/i18n-bo.js';
import Argument from '../system/argument-check.js';
import ValidationRule from '../rules/validation-rule.js';
import RuleSeverity from '../rules/rule-severity.js';
import PropertyInfo from '../common/property-info.js';

const t = i18n( 'Rules' );

//endregion

/**
 * The rule ensures that the changes of the property value start
 * the rule checking on the dependent properties as well.
 *
 * @memberof bo.commonRules
 * @extends bo.rules.ValidationRule
 */
class DependencyRule extends ValidationRule {

  /**
   * Creates a new dependency rule object.
   *
   * @param {bo.common.PropertyInfo} primaryProperty - The property definition the rule relates to.
   * @param {(bo.common.PropertyInfo|Array.<bo.common.PropertyInfo>)} dependencies -
   *    A single dependent property or an array of them.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=-100] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The primary property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The dependencies must be
   *    an array of PropertyInfo objects or a single PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The message must be a non-empty string.
   */
  constructor( primaryProperty, dependencies, message, priority, stopsProcessing ) {
    super( 'Dependency' );

    dependencies = Argument.inConstructor( DependencyRule.name )
      .check( dependencies ).forMandatory( 'dependencies' ).asArray( PropertyInfo );

    // Initialize base properties.
    this.initialize(
      primaryProperty,
      message || t( 'dependency' ),
      priority || -100,
      stopsProcessing
    );

    dependencies.forEach( ( dependency ) => {
      this.addAffectedProperty( dependency );
    } );

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Ensures that the changes of the property value start
   * the rule checking on the dependent properties as well.
   *
   * @function bo.commonRules.DependencyRule#execute
   * @param {Array.<*>} inputs - An array of the values of the required properties.
   * @returns {(bo.rules.ValidationResult|undefined)} Information about the failure.
   */
  execute( inputs ) {

    const value = inputs[ this.primaryProperty.name ];

    if (this.primaryProperty.hasValue( value ))
      return this.result( this.message, RuleSeverity.success );
  }
}

export default DependencyRule;
