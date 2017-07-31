'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import MethodError from '../system/method-error.js';
import RuleList from './rule-list.js';
import ValidationRule from './validation-rule.js';
import ValidationContext from './validation-context.js';
import AuthorizationRule from './authorization-rule.js';
import AuthorizationContext from './authorization-context.js';
import RuleSeverity from './rule-severity.js';
import NoAccessBehavior from './no-access-behavior.js';
import PropertyInfo from '../common/property-info.js';

//endregion

//region Private variables

const _validationRules = new WeakMap();
const _authorizationRules = new WeakMap();
const _noAccessBehavior = new WeakMap();

//endregion

/**
 * Provides methods to manage the rules of a business object model.
 *
 * @memberof bo.rules
 */
class RuleManager {

  //region Constructor

  /**
   * Creates a new rule manager object.
   *
   * @param {Array.<(bo.rules.ValidationRule|bo.rules.AuthorizationRule)>} [rules] -
   *      an optional array of validation and authorization rules to set up the rule manager.
   */
  constructor( ...rules ) {

    _validationRules.set( this, new RuleList() );
    _authorizationRules.set( this, new RuleList() );
    _noAccessBehavior.set( this, null );

    rules.forEach( rule => {
      this.add( rule );
    } );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Properties

  /**
   * Defines the default behavior for unauthorized operations.
   * @member {bo.rules.NoAccessBehavior} bo.rules.RuleManager#noAccessBehavior
   * @default {bo.rules.NoAccessBehavior#throwError}
   */
  get noAccessBehavior() {
    return _noAccessBehavior.get( this );
  }

  set noAccessBehavior( value ) {
    _noAccessBehavior.set( this,
      Argument.inProperty( this.constructor.name, 'noAccessBehavior' )
        .check( value ).for().asEnumMember( NoAccessBehavior, NoAccessBehavior.throwError )
    );
  }

  //endregion

  //region Methods

  /**
   * Adds a new rule to the business object model.
   *
   * @param {(bo.rules.ValidationRule|bo.rules.AuthorizationRule)} rule - The rule to add.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The rule must be a Rule object.
   * @throws {@link bo.system.ArgumentError Argument error}: The rule is not initialized.
   */
  add( rule ) {

    if (rule instanceof ValidationRule) {
      if (!rule.primaryProperty)
        throw new ArgumentError( 'notInitRule', this.constructor.name, 'add', 'rule' );
      const validationRules = _validationRules.get( this );
      validationRules.set( rule.primaryProperty.name, rule );
      _validationRules.set( this, validationRules );
    }
    else if (rule instanceof AuthorizationRule) {
      if (!rule.ruleId)
        throw new ArgumentError( 'notInitRule', this.constructor.name, 'add', 'rule' );
      const authorizationRules = _authorizationRules.get( this );
      authorizationRules.set( rule.ruleId, rule );
      _authorizationRules.set( this, authorizationRules );
    }
    else
      throw new MethodError( 'manType', this.constructor.name, 'add', 'rule', 'Rule' );
  }

  /**
   * Initializes the rule manager: sorts the rules by priority and
   * sets the default behavior for unauthorized operations.
   *
   * @param {bo.rules.NoAccessBehavior} defaultBehavior - The default behavior for unauthorized operations.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The severity must be a NoAccessBehavior item.
   */
  initialize( defaultBehavior ) {
    this.noAccessBehavior = defaultBehavior;

    const validationRules = _validationRules.get( this );
    validationRules.sort();
    _validationRules.set( this, validationRules );

    const authorizationRules = _authorizationRules.get( this );
    authorizationRules.sort();

    for (const array in authorizationRules.values()) {
      array.forEach( rule => {
        rule.noAccessBehavior = defaultBehavior;
      } );
    }
    _authorizationRules.set( this, authorizationRules );
  };

  /**
   * Validates a property - executes all validation rules of the property.
   *
   * @param {bo.common.PropertyInfo} property - The model property to validate.
   * @param {bo.rules.ValidationContext} context - The context of the property validation.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property must be a PropertyInfo object.
   * @throws {@link bo.system.ArgumentError Argument error}: The context must be a ValidationContext object.
   */
  validate( property, context ) {
    const check = Argument.inMethod( this.constructor.name, 'validate' );

    property = check( property ).forMandatory( 'property' ).asType( PropertyInfo );
    context = check( context ).forMandatory( 'context' ).asType( ValidationContext );

    context.brokenRules.clear( property );

    const validationRules = _validationRules.get( this );
    if (validationRules.has( property.name )) {
      const rules = validationRules.get( property.name );

      for (let i = 0; i < rules.length; i++) {
        const rule = rules[ i ];
        const result = rule.execute( rule.getInputValues( context.getValue ) );

        if (result) {
          if (result.severity !== RuleSeverity.success) {
            context.brokenRules.add( result.toBrokenRule() );
          }
          if (result.affectedProperties) {
            result.affectedProperties.forEach( function ( affectedProperty ) {
              self.validate( affectedProperty, context );
            } );
          }
          if (result.stopsProcessing)
            break;
        }
      }
    }
  }

  /**
   * Validates a property - executes all validation rules of the property.
   *
   * @param {bo.rules.AuthorizationContext} context - The context of the action authorization.
   * @returns {boolean} True when the user is allowed to execute the action, otherwise false.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The context must be a AuthorizationContext object.
   * @throws {@link bo.rules.AuthorizationError Authorization error}: The user has no permission to execute the action.
   */
  hasPermission( context ) {

    context = Argument.inMethod( this.constructor.name, 'hasPermission' )
      .check( context ).forMandatory( 'context' ).asType( AuthorizationContext );
    let isAllowed = true;

    const authorizationRules = _authorizationRules.get( this );
    if (authorizationRules.has( context.ruleId )) {
      const rules = authorizationRules.get( context.ruleId );

      for (let i = 0; i < rules.length; i++) {
        const result = rules[ i ].execute( context.user );

        if (result) {
          context.brokenRules.push( result.toBrokenRule() );
          isAllowed = false;
          if (result.stopsProcessing)
            break;
        }
      }
    }
    return isAllowed;
  }

  //endregion
}

export default RuleManager;
