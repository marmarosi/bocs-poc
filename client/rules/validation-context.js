'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import DataStore from '../common/data-store.js';
import BrokenRuleList from './broken-rule-list.js';

//endregion

/**
 * Provides the context for custom validation rules.
 *
 * @memberof bo.rules
 */
class ValidationContext {

  /**
   * Creates a new validation context object.
   *   </br></br>
   * <i><b>Warning:</b> Validation context objects are created in models internally.
   * They are intended only to make publicly available the context
   * for custom validation rules.</i>
   *
   * @param {bo.common.DataStore} dataStore - The storage of the property values.
   * @param {bo.rules.BrokenRuleList} brokenRules - The list of the broken rules.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The data store must be a DataStore object.
   * @throws {@link bo.system.ArgumentError Argument error}: The broken rules must be a BrokenRuleList object.
   */
  constructor( dataStore, brokenRules ) {
    const check = Argument.inConstructor( this.constructor.name );

    dataStore = check( dataStore ).forMandatory( 'dataStore' ).asType( DataStore );

    /**
     * Returns the value of a model property.
     * @member {internal~getValue} bo.rules.ValidationContext#getValue
     * @readonly
     */
    this.getValue = function ( property ) {
      return dataStore.hasValidValue( property ) ? dataStore.getValue( property ) : undefined;
    };

    /**
     * The list of the broken rules.
     * @member {bo.rules.BrokenRuleList} bo.rules.ValidationContext#brokenRules
     * @readonly
     */
    this.brokenRules = check( brokenRules ).forMandatory( 'brokenRules' ).asType( BrokenRuleList );

    // Immutable object.
    Object.freeze( this );
  }
}

export default ValidationContext;
