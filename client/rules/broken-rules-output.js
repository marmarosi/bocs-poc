'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import RuleNotice from './rule-notice.js';

//endregion

//region Private variables

const _length = new WeakMap();
const _count = new WeakMap();
const _index = new WeakMap();
const _childObjects = new WeakMap();
const _childCollections = new WeakMap();

//endregion

//region Helper methods

function incrementLength() {
  let length = _length.get( this );
  length++;
  _length.set( this, length );
}

function incrementCount() {
  let count = _count.get( this );
  count++;
  _count.set( this, count );
}

function getName( index ) {
  if (index === undefined || index === null || typeof index !== 'number')
    index = 0;
  return ('00000' + index.toString()).slice( -5 );
}

//endregion

/**
 * Represents the public format of broken rules. The output object
 * has a property for each model property that has broken rule.
 *
 * If the model property is a simple property, i.e. it is defined by
 * a {@link bo.dataTypes.DataType data type}, then the output property
 * is an array. The array elements are {@link bo.rules.RuleNotice rule notice}
 * objects representing the broken rules.
 *
 * If the model property is a child object, then the output property
 * is an object as well, whose properties represents model properties
 * with broken rules, as described above.
 *
 * If the model property is a child collection, then the output property
 * is an object as well, whose properties are the indeces of the items of
 * the collections. The property name is a number in '00000' format. The
 * property value represents the child item, as described above.
 *
 * @memberof bo.rules
 */
class BrokenRulesOutput {

  //region Constructor

  /**
   * Creates a new broken rules output instance.
   */
  constructor() {

    _length.set( this, 0 );
    _count.set( this, 0 );
    _index.set( this, null );
    _childObjects.set( this, [] );
    _childCollections.set( this, [] );
  }

  //endregion

  //region Properties

  /**
   * Returns the count of properties that have broken rules.
   * @member {number} bo.rules.BrokenRulesOutput#$length
   * @readonly
   */
  get $length() {
    return _length.get( this );
  }

  /**
   * Returns the count of broken rules.
   * @member {number} bo.rules.BrokenRulesOutput#$count
   * @readonly
   */
  get $count() {
    let total = _count.get( this );

    // Add notice counts of child objects.
    const self = this;
    const childObjects = _childObjects.get( this );
    childObjects.forEach( childName => {
      total += self[ childName ].$count;
    } );

    // Add notice counts of child collection items.
    const childCollections = _childCollections.get( this );
    childCollections.forEach( collectionName => {
      const collection = self[ collectionName ];
      for (const index in collection) {
        if (collection.hasOwnProperty( index ))
          total += collection[ index ].$count;
      }
    } );

    return total;
  }

  /**
   * The position of the model instance in the collection.
   * @member {number} bo.rules.BrokenRulesOutput#$index
   */
  get $index() {
    return _index.get( this );
  }

  set $index( value ) {
    const index = Argument.inProperty( BrokenRulesOutput.$index, '$index' )
      .check( value ).forOptional().asInteger();
    _index.set( this, index );
  }

  //endregion

  //region Methods

  /**
   * Adds a rule notice to the response object.
   *
   * @param {string} propertyName - The name of the property.
   * @param {bo.rules.RuleNotice} notice - The public form of the broken rule.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The notice must be a RuleNotice object.
   */
  add( propertyName, notice ) {
    const check = Argument.inMethod( this.constructor.name, 'add' );

    propertyName = check( propertyName ).forMandatory( 'propertyName' ).asString();
    notice = check( notice ).forMandatory( 'notice' ).asType( RuleNotice );

    if (this[ propertyName ])
      this[ propertyName ].push( notice );
    else {
      this[ propertyName ] = new Array( notice );
      incrementLength.call( this );
    }
    incrementCount.call( this );
  }

  /**
   * Adds a child response object to the response object
   * when the child object is not a collection.
   *
   * @param {string} propertyName - The name of the property.
   * @param {bo.rules.BrokenRulesOutput} output - The response object of a child property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The output must be a BrokenRulesOutput object.
   */
  addChild( propertyName, output ) {
    const check = Argument.inMethod( this.constructor.name, 'addChild' );

    propertyName = check( propertyName ).forMandatory( 'propertyName' ).asString();
    output = check( output ).forMandatory( 'output' ).asType( BrokenRulesOutput );

    this[ propertyName ] = output;

    const childObjects = _childObjects.get( this );
    childObjects.push( propertyName );
    _childObjects.set( this, childObjects );

    incrementLength.call( this );
  }

  /**
   * Adds child response objects to the response object
   * when the child object belongs to a root collection.
   *
   * @param {number} index - The position of the child object in the collection.
   * @param {bo.rules.BrokenRulesOutput} output - The response object of a child property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The index must be an integer.
   * @throws {@link bo.system.ArgumentError Argument error}: The output must be a BrokenRulesOutput object.
   */
  addItem( index, output ) {
    const check = Argument.inMethod( this.constructor.name, 'addChild' );

    index = check( index ).forMandatory( 'index' ).asInteger();
    output = check( output ).forMandatory( 'output' ).asType( BrokenRulesOutput );

    const indexName = getName( index );
    output.$index = index;
    this[ indexName ] = output;

    const childObjects = _childObjects.get( this );
    childObjects.push( indexName );
    _childObjects.set( this, childObjects );

    incrementLength.call( this );
  }

  /**
   * Adds child response objects to the response object
   * when the child object belongs to a child collection.
   *
   * @param {string} propertyName - The name of the property.
   * @param {Array.<bo.rules.BrokenRulesOutput>} outputs - The response objects of a child collection property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The outputs must be an array of BrokenRulesOutput objects or a single BrokenRulesOutput object.
   */
  addChildren( propertyName, outputs ) {
    const check = Argument.inMethod( this.constructor.name, 'addChildren' );

    propertyName = check( propertyName ).forMandatory( 'propertyName' ).asString();
    outputs = check( outputs ).forMandatory( 'outputs' ).asArray( BrokenRulesOutput );

    let list = {};
    outputs.forEach( ( output ) => {
      list[ getName( output.$index ) ] = output;
    } );
    this[ propertyName ] = list;

    const childCollections = _childCollections.get( this );
    childCollections.push( propertyName );
    _childCollections.set( this, childCollections );

    incrementLength.call( this );
  }

  //endregion
}

export default BrokenRulesOutput;
