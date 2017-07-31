'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import PropertyInfo from '../common/property-info.js';
import BrokenRule from './broken-rule.js';
import BrokenRulesOutput from './broken-rules-output.js';
import RuleNotice from './rule-notice.js';
import RuleSeverity from './rule-severity.js';

//endregion

/**
 * Represents the lists of broken rules.
 *
 * @memberof bo.rules
 */
class BrokenRuleList extends Map {

  //region Constructor

  /**
   * Creates a new broken rule list instance.
   *
   * @param {string} modelName - The name of the model.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
   */
  constructor( modelName ) {
    super();

    /**
     * The name of the model that broken rules the list contains of.
     *
     * @member {string} bo.rules.BrokenRuleList#modelName
     * @readonly
     */
    this.modelName = Argument.inConstructor( this.constructor.name )
      .check( modelName ).forMandatory( 'modelName' ).asString();

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Methods

  /**
   * Adds a broken rule to the list.
   *
   * @param {bo.rules.BrokenRule} brokenRule - A broken rule to add.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The rule must be a BrokenRule object.
   */
  add( brokenRule ) {

    brokenRule = Argument.inMethod( this.constructor.name, 'add' )
      .check( brokenRule ).forMandatory( 'brokenRule' ).asType( BrokenRule );

    const key = brokenRule.propertyName;

    if (super.has( key )) {
      const list = super.get( key );
      list.push( brokenRule );
      super.set( key, list );
    }
    else
      super.set( key, new Array( brokenRule ) );
  }

  /**
   * Removes the broken rules of a property except of the retained ones.
   * If property is omitted, all broken rules are removed
   * except of the retained ones.
   *
   * @param {bo.rules.PropertyInfo} [property] - A property definition.
   */
  clear( property ) {

    //region Clear for property

    /**
     * Removes the broken rules of a property except of the retained ones.
     *
     * @param {string} propertyName - The name of the property that broken rules are deleted of.
     */
    function clearFor( propertyName ) {

      if (this.has( propertyName )) {

        const preserved = this.get( propertyName ).filter( function ( item ) {
          return item.isPreserved;
        } );

        if (preserved.length)
          this.set( propertyName, preserved );
        else
          this.delete( propertyName );
      }
    }

    //endregion

    if (property instanceof PropertyInfo)
      clearFor.call( this, property.name );
    else
      for (const propertyName of super.keys()) {
        clearFor.call( this, propertyName );
      }
  }

  /**
   * Removes the broken rules of a property, including retained ones.
   * If property is omitted, all broken rules are removed.
   *
   * @param property
   */
  clearAll( property ) {

    if (property instanceof PropertyInfo)
      super.delete( property.name );
    else
      super.clear();
  }

  /**
   * Determines if the model is valid. The model is valid when it has no
   * broken rule with error severity.
   *
   * @returns {boolean} - True if the model is valid, otherwise false.
   */
  isValid() {

    for (const list of super.values()) {
      if (list.some( function ( item ) {
          return item.severity === RuleSeverity.error;
        } ))
        return false;
    }
    return true;
  }

  /**
   * Transforms the broken rules into a format that can be sent to the client.
   *
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {bo.rules.BrokenRulesOutput} The response object to send.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The namespace must be a string.
   */
  output( namespace ) {

    namespace = Argument.inMethod( this.constructor.name, 'output' )
      .check( namespace ).forOptional( 'namespace' ).asString();

    const data = new BrokenRulesOutput();

    if (this.size) {
      const self = this;
      const ns = namespace ? namespace + ':' : '';

      for (const property of super.keys()) {
        super.get( property ).forEach( function ( brokenRule ) {

          const propertyName = self.modelName + '.' + brokenRule.propertyName;
          const message = brokenRule.message || ns + propertyName + '.' + brokenRule.ruleName;
          const notice = new RuleNotice( message, brokenRule.severity );

          data.add( propertyName, notice );
        } );
      }
    }
    return data;
  }

  //endregion
}

export default BrokenRuleList;
