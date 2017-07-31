'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import AuthorizationRule from './authorization-rule.js';
import ValidationRule from './validation-rule.js';

//endregion

// Rules are sorted descending by priority.
function sortByPriority( a, b ) {
  if (a.priority > b.priority) {
    return -1;
  }
  if (a.priority < b.priority) {
    return 1;
  }
  return 0;
}

/**
 * Represents the lists of rules of a model instance.
 *
 * @memberof bo.rules
 * @extends Map
 */
class RuleList extends Map {

  /**
   * Creates a new rule list.
   */
  constructor() {
    super();
    Object.freeze( this );
  }

  /**
   * Adds a new rule to the list of rules of the property identified.
   *
   * @function bo.rules.RuleList#add
   * @param {string} id - The identifier of the rule list, typically the property name.
   * @param {(bo.rules.ValidationRule|bo.rules.AuthorizationRule)} rule - A validation or authorization rule.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The identifier must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The rule must be a ValidationRule or AuthorizationRule object.
   */
  set( id, rule ) {
    const check = Argument.inMethod( this.constructor.name, 'add' );

    id = check( id ).forMandatory( 'id' ).asString();
    rule = check( rule ).forMandatory( 'rule' ).asType( [ ValidationRule, AuthorizationRule ] );

    if (this.has( id )) {
      const array = this.get( id );
      array.push( rule );
      super.set( id, array );
    }
    else
      super.set( id, new Array( rule ) );
  }

  /**
   * Sorts the lists of rules by {@link bo.rules.RuleBase#priority rule priority}.
   *
   * @function bo.rules.RuleList#sort
   */
  sort() {
    for (const array of this.values()) {
      array.sort( sortByPriority );
    }
  }
}

export default RuleList;
