'use strict';

//region Imports

import Argument from './system/argument-check.js';

import CollectionBase from './common/collection-base.js';
import ModelType from './common/model-type.js';
import ModelError from './common/model-error.js';

//endregion

//region Private variables

const _itemType = new WeakMap();
const _parent = new WeakMap();
const _eventHandlers = new WeakMap();
const _items = new WeakMap();

//endregion

//region Helper methods

function initialize( name, itemType, parent, eventHandlers ) {

  // Verify the model type of the parent model.
  parent = Argument.inConstructor( name )
    .check( parent ).for( 'parent' ).asModelType( [
      ModelType.ReadOnlyRootObject,
      ModelType.ReadOnlyChildObject,
      ModelType.CommandObject
    ] );

  // Resolve tree reference.
  if (typeof itemType === 'string') {
    if (itemType === parent.$modelName)
      itemType = parent.constructor;
    else
      throw new ModelError( 'invalidTree', itemType, parent.$modelName );
  }

  // Set up event handlers.
  if (eventHandlers)
    eventHandlers.setup( this );

  // Initialize instance state.
  _itemType.set( this, itemType );
  _parent.set( this, parent );
  _eventHandlers.set( this, eventHandlers );
  _items.set( this, [] );

  // Immutable definition object.
  Object.freeze( this );
}

//endregion

/**
 * Represents the definition of a read-only child collection.
 *
 * _The name of the model type available as:
 * __&lt;instance&gt;.constructor.modelType__, returns 'ReadOnlyChildCollection'._
 *
 * @name ReadOnlyChildCollection
 * @extends CollectionBase
 */
class ReadOnlyChildCollection extends CollectionBase {

  //region Constructor

  /**
   * Creates a new read-only child collection instance.
   *
   * Valid parent model types are:
   *
   *   * ReadOnlyRootObject
   *   * ReadOnlyChildObject
   *   * CommandObject
   *
   * @param {object} parent - The parent business object.
   * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The parent object must be an ReadOnlyRootObject, ReadOnlyChildObject
   *    or CommandObject instance.
   */
  constructor( name, itemType, parent, eventHandlers ) {
    super();

    /**
     * The name of the model.
     *
     * @member {string} ReadOnlyChildCollection#$modelName
     * @readonly
     */
    this.$modelName = name;

    // Initialize the instance.
    initialize.call( this, name, itemType, parent, eventHandlers );
  }

  //endregion

  //region Properties

  /**
   * The count of the child objects in the collection.
   *
   * @member {number} ReadOnlyChildCollection#count
   * @readonly
   */
  get count() {
    const items = _items.get( this );
    return items.length;
  }

  /**
   * The name of the model type.
   *
   * @member {string} ReadOnlyChildCollection.modelType
   * @readonly
   */
  static get modelType() {
    return ModelType.ReadOnlyChildCollection;
  }

  //endregion

  //region Transfer object methods

  /**
   * Transforms the business object collection to a plain object array to send to the client.
   * <br/>_This method is usually called by the parent object._
   *
   * @function ReadOnlyChildCollection#toCto
   * @returns {Array.<object>} The client transfer object.
   */
  toCto() {
    const cto = [];
    this.forEach( item => {
      cto.push( item.toCto() );
    } );
    return cto;
  }

  //endregion

  //region Actions

  /**
   * Initializes the items in the collection with data retrieved from the repository.
   *
   * _This method is called by the parent object._
   *
   * @function ReadOnlyChildCollection#fetch
   * @protected
   * @param {Array.<object>} [data] - The data to load into the business object collection.
   * @returns {Promise.<ReadOnlyChildCollection>} Returns a promise to retrieved read-only child collection.
   */
  fetch( data ) {
    const self = this;
    return data instanceof Array && data.length ?

      Promise.all( data.map( dto => {
        let itemType = _itemType.get( self );
        const parent = _parent.get( self );
        const eventHandlers = _eventHandlers.get( self );
        return itemType.load( parent, dto, eventHandlers );
      } ) )
        .then( list => {

          // Add loaded items to the collection.
          const items = _items.get( self );
          list.forEach( item => {
            items.push( item );
          } );
          _items.set( self, items );

          // Nothing to return.
          return null;
        } ) :
      Promise.resolve( null );
  }

  /**
   * Indicates whether all items of the business collection are valid.
   *
   * _This method is called by the parent object._
   *
   * @function ReadOnlyChildCollection#isValid
   * @protected
   * @returns {boolean}
   */
  isValid() {
    return this.every( item => {
      return item.isValid();
    } )
  }

  /**
   * Executes validation on all items of the collection.
   *
   * _This method is called by the parent object._
   *
   * @function ReadOnlyChildCollection#checkRules
   * @protected
   */
  checkRules() {
    this.forEach( item => {
      item.checkRules();
    } );
  }

  /**
   * Gets the broken rules of all items of the collection.
   *
   * _This method is called by the parent object._
   *
   * @function ReadOnlyChildCollection#getBrokenRules
   * @protected
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {Array.<bo.rules.BrokenRulesOutput>} The broken rules of the collection.
   */
  getBrokenRules( namespace ) {
    const bro = [];
    this.forEach( ( item, index ) => {
      const childBrokenRules = item.getBrokenRules( namespace );
      if (childBrokenRules) {
        childBrokenRules.$index = index;
        bro.push( childBrokenRules );
      }
    } );
    return bro.length ? bro : null;
  }

  //endregion

  //region Public array methods

  /**
   * Gets a collection item at a specific position.
   *
   * @function ReadOnlyChildCollection#at
   * @param {number} index - The index of the required item in the collection.
   * @returns {ReadOnlyChildObject} The required collection item.
   */
  at( index ) {
    const items = _items.get( this );
    return items[ index ];
  }

  /**
   * Executes a provided function once per collection item.
   *
   * @function ReadOnlyChildCollection#forEach
   * @param {external.cbCollectionItem} callback - Function that produces an item of the new collection.
   */
  forEach( callback ) {
    const items = _items.get( this );
    items.forEach( callback );
  }

  /**
   * Tests whether all items in the collection pass the test implemented by the provided function.
   *
   * @function ReadOnlyChildCollection#every
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {boolean} True when callback returns truthy value for each item, otherwise false.
   */
  every( callback ) {
    const items = _items.get( this );
    return items.every( callback );
  }

  /**
   * Tests whether some item in the collection pass the test implemented by the provided function.
   *
   * @function ReadOnlyChildCollection#some
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {boolean} True when callback returns truthy value for some item, otherwise false.
   */
  some( callback ) {
    const items = _items.get( this );
    return items.some( callback );
  }

  /**
   * Creates a new array with all collection items that pass the test
   * implemented by the provided function.
   *
   * @function ReadOnlyChildCollection#filter
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {Array.<ReadOnlyChildObject>} The new array of collection items.
   */
  filter( callback ) {
    const items = _items.get( this );
    return items.filter( callback );
  }

  /**
   * Creates a new array with the results of calling a provided function
   * on every item in this collection.
   *
   * @function ReadOnlyChildCollection#map
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {Array.<*>} The new array of callback results.
   */
  map( callback ) {
    const items = _items.get( this );
    return items.map( callback );
  }

  /**
   * Sorts the items of the collection in place and returns the collection.
   *
   * @function ReadOnlyChildCollection#sort
   * @param {external.cbCompare} [fnCompare] - Function that defines the sort order.
   *      If omitted, the collection is sorted according to each character's Unicode
   *      code point value, according to the string conversion of each item.
   * @returns {ReadOnlyChildCollection} The sorted collection.
   */
  sort( fnCompare ) {
    const items = _items.get( this );
    const sorted = items.sort( fnCompare );
    _items.set( this, sorted );
    return sorted;
  }

  //endregion
}

/**
 * Factory class to create definitions of read-only child collections.
 *
 * @name bo.ReadOnlyChildCollection
 */
class ReadOnlyChildCollectionFactory {

  //region Constructor

  /**
   * Creates a definition for a read-only child collection.
   *
   *    Valid collection item types are:
   *
   *      * ReadOnlyChildObject
   *
   * @param {string} name - The name of the collection.
   * @param {ReadOnlyChildObject} itemType - The model type of the collection items.
   * @returns {ReadOnlyChildCollection} The constructor of a read-only child collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The collection name must be a non-empty string.
   * @throws {@link bo.common.ModelError Model error}: The item type must be an ReadOnlyChildObject.
   */
  constructor( name, itemType ) {

    name = Argument.inConstructor( ModelType.ReadOnlyChildCollection )
      .check( name ).forMandatory( 'name' ).asString();

    // Verify the model type of the items - when not a tree model.
    if (
      typeof itemType !== 'string' &&
      itemType.modelType !== ModelType.ReadOnlyChildObject
    )
      throw new ModelError( 'invalidItem',
        itemType.prototype.name, itemType.modelType,
        ModelType.ReadOnlyChildCollection, ModelType.ReadOnlyChildObject );

    // Create model definition.
    const Model = ReadOnlyChildCollection.bind( undefined, name, itemType );

    //region Factory methods

    /**
     * The name of the model type.
     *
     * @member {string} ReadOnlyChildCollection.modelType
     * @readonly
     */
    Model.modelType = ModelType.ReadOnlyChildCollection;

    /**
     * Creates a new uninitialized read-only child collection instance.
     * <br/>_This method is called by the parent object._
     *
     * @function ReadOnlyChildCollection.empty
     * @protected
     * @param {object} parent - The parent business object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {ReadOnlyChildCollection} Returns a new read-only child collection.
     */
    Model.empty = function ( parent, eventHandlers ) {
      return new Model( parent, eventHandlers );
    };

    //endregion

    // Immutable definition class.
    Object.freeze( Model );
    return Model;
  }

  //endregion
}
// Immutable factory class.
Object.freeze( ReadOnlyChildCollectionFactory );

export default ReadOnlyChildCollectionFactory;
