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

//region Initialization

function initialize( name, itemType, parent, eventHandlers ) {

  // Verify the model type of the parent model.
  parent = Argument.inConstructor(name)
    .check(parent).for('parent').asModelType([
      ModelType.EditableRootObject,
      ModelType.EditableChildObject
    ]);

  // Resolve tree reference.
  if (typeof itemType === 'string') {
    if (itemType === parent.$modelName)
      itemType = parent.constructor;
    else
      throw new ModelError('invalidTree', itemType, parent.$modelName);
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

//endregion

/**
 * Represents the definition of an editable child collection.
 *
 * _The name of the model type available as:
 * __&lt;instance&gt;.constructor.modelType__, returns 'EditableChildCollection'._
 *
 * @name EditableChildCollection
 * @extends CollectionBase
 */
class EditableChildCollection extends CollectionBase {

  //region Constructor

  /**
   * Creates a new editable child collection instance.
   *
   * Valid parent model types are:
   *
   *   * EditableRootObject
   *   * EditableChildObject
   *
   * @param {object} parent - The parent business object.
   * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
   *
   * @throws {@link bo.system.ArgumentError Argument error}:
   *    The parent object must be an EditableRootObject or EditableChildObject instance.
   */
  constructor(name, itemType, parent, eventHandlers) {
    super();

    /**
     * The name of the model.
     *
     * @name EditableChildCollection#$modelName
     * @type {string}
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
   * @name EditableChildCollection#count
   * @type {number}
   * @readonly
   */
  get count() {
    const items = _items.get( this );
    return items.length;
  }

  /**
   * The name of the model type.
   *
   * @property {string} EditableChildCollection.modelType
   * @default EditableChildCollection
   * @readonly
   */
  static get modelType() {
    return ModelType.EditableChildCollection;
  }

  //endregion

  //region Transfer object methods

  /**
   * Transforms the business object collection to a plain object array to send to the server.
   * <br/>_This method is usually called by the parent object._
   *
   * @function EditableChildCollection#toDto
   * @returns {Array.<object>} The data transfer object.
   */
  toDto() {
    const dto = [];
    this.forEach( item => {
      dto.push( item.toDto() );
    } );
    return dto;
  }

  fromDto( dto ) {
    let i = 0;
    this.forEach( item => {
      item.fromDto( dto[ i++ ] );
    } );
  }

  //endregion

  //region Actions

  /**
   * Creates a new item and adds it to the collection at the specified index.
   *
   * @function EditableChildCollection#create
   * @param {number} index - The index of the new item.
   * @returns {Promise.<EditableChildObject>} Returns a promise to the editable child object created.
   */
  createItem( index ) {
    const items = _items.get(this);
    const itemType = _itemType.get(this);
    const parent = _parent.get(this);
    const eventHandlers = _eventHandlers.get(this);

    return itemType.create( parent, eventHandlers )
      .then( item => {
        let ix = parseInt( index || items.length, 10 );
        ix = isNaN( ix ) ? items.length : ix;
        items.splice( ix, 0, item );
        _items.set(this, items);
        return item;
      });
  }

  /**
   * Initializes the items in the collection with data retrieved from the repository.
   * <br/>_This method is called by the parent object._
   *
   * @function EditableChildCollection#fetch
   * @protected
   * @param {Array.<object>} [data] - The data to load into the business object collection.
   * @returns {Promise.<EditableChildCollection>} Returns a promise to the retrieved editable child collection.
   */
  fetch( data ) {
    const self = this;
    const items = _items.get(this);
    const itemType = _itemType.get(this);
    const parent = _parent.get(this);
    const eventHandlers = _eventHandlers.get(this);

    return data instanceof Array && data.length ?
      Promise.all( data.map( dto => {
        return itemType.load( parent, dto, eventHandlers )
      }))
        .then( list => {
          // Add loaded items to the collection.
          list.forEach( item => {
            items.push( item );
          });
          _items.set(self, items);
          // Nothing to return.
          return null;
        }) :
      Promise.resolve( null );
  }

  /**
   * Marks all items in the collection to be deleted from the repository on next save.
   *
   * @function EditableChildCollection#remove
   */
  remove() {
    this.forEach(function (item) {
      item.remove();
    });
  }

  /**
   * Indicates whether all items of the business collection are valid.
   * <br/>_This method is called by the parent object._
   *
   * @function EditableChildCollection#isValid
   * @protected
   * @returns {boolean}
   */
  isValid() {
    let items = _items.get(this);
    return items.every(function (item) {
      return item.isValid();
    });
  }

  /**
   * Executes validation on all items of the collection.
   * <br/>_This method is called by the parent object._
   *
   * @function EditableChildCollection#checkRules
   * @protected
   */
  checkRules() {
    this.forEach(function (item) {
      item.checkRules();
    });
  }

  /**
   * Gets the broken rules of all items of the collection.
   * <br/>_This method is called by the parent object._
   *
   * @function EditableChildCollection#getBrokenRules
   * @protected
   * @param {string} [namespace] - The namespace of the message keys when messages are localizable.
   * @returns {Array.<bo.rules.BrokenRulesOutput>} The broken rules of the collection.
   */
  getBrokenRules(namespace) {
    const bro = [];
    this.forEach( ( item, index) => {
      let childBrokenRules = item.getBrokenRules(namespace);
      if (childBrokenRules) {
        childBrokenRules.$index = index;
        bro.push( childBrokenRules );
      }
    });
    return bro.length ? bro : null;
  }

  //endregion

  //region Public array methods

  /**
   * Gets a collection item at a specific position.
   *
   * @function EditableChildCollection#at
   * @param {number} index - The index of the required item in the collection.
   * @returns {EditableChildObject} The required collection item.
   */
  at(index) {
    const items = _items.get(this);
    return items[index];
  }

  /**
   * Executes a provided function once per collection item.
   *
   * @function EditableChildCollection#forEach
   * @param {external.cbCollectionItem} callback - Function that produces an item of the new collection.
   */
  forEach(callback) {
    const items = _items.get(this);
    items.forEach(callback);
  }

  /**
   * Tests whether all items in the collection pass the test implemented by the provided function.
   *
   * @function EditableChildCollection#every
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {boolean} True when callback returns truthy value for each item, otherwise false.
   */
  every(callback) {
    const items = _items.get(this);
    return items.every(callback);
  }

  /**
   * Tests whether some item in the collection pass the test implemented by the provided function.
   *
   * @function EditableChildCollection#some
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {boolean} True when callback returns truthy value for some item, otherwise false.
   */
  some(callback) {
    const items = _items.get(this);
    return items.some(callback);
  }

  /**
   * Creates a new array with all collection items that pass the test
   * implemented by the provided function.
   *
   * @function EditableChildCollection#filter
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {Array.<EditableChildObject>} The new array of collection items.
   */
  filter(callback) {
    const items = _items.get(this);
    return items.filter(callback);
  }

  /**
   * Creates a new array with the results of calling a provided function
   * on every item in this collection.
   *
   * @function EditableChildCollection#map
   * @param {external.cbCollectionItem} callback - Function to test for each collection item.
   * @returns {Array.<*>} The new array of callback results.
   */
  map(callback) {
    const items = _items.get(this);
    return items.map(callback);
  }

  /**
   * Sorts the items of the collection in place and returns the collection.
   *
   * @function EditableChildCollection#sort
   * @param {external.cbCompare} [fnCompare] - Function that defines the sort order.
   *      If omitted, the collection is sorted according to each character's Unicode
   *      code point value, according to the string conversion of each item.
   * @returns {EditableChildCollection} The sorted collection.
   */
  sort(fnCompare) {
    const items = _items.get( this );
    const sorted = items.sort( fnCompare );
    _items.set( this, sorted );
    return sorted;
  }

  //endregion
}

/**
 * Factory method to create definitions of editable child collections.
 *
 * @name bo.EditableChildCollection
 */
class EditableChildCollectionFactory {

  //region Constructor

  /**
   * Creates a definition for an editable child collection.
   *
   *    Valid collection item types are:
   *
   *      * EditableChildObject
   *
   * @param {string} name - The name of the collection.
   * @param {EditableChildObject} itemType - The model type of the collection items.
   * @returns {EditableChildCollection} The constructor of an editable child collection.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The collection name must be a non-empty string.
   * @throws {@link bo.common.ModelError Model error}: The item type must be an EditableChildObject.
   */
  constructor(name, itemType) {

    name = Argument.inConstructor(ModelType.EditableChildCollection)
      .check(name).forMandatory('name').asString();

    // Verify the model type of the items - when not a tree model.
    if (
      typeof itemType !== 'string' &&
      itemType.modelType !== ModelType.EditableChildObject
    )
      throw new ModelError( 'invalidItem',
        itemType.prototype.name, itemType.modelType,
        ModelType.EditableChildCollection, ModelType.EditableChildObject );

    // Create model definition.
    const Model = EditableChildCollection.bind( undefined, name, itemType );

    /**
     * The name of the model type.
     *
     * @member {string} EditableChildCollection.modelType
     * @readonly
     */
    Model.modelType = ModelType.EditableChildCollection;

    //region Factory methods

    /**
     * Creates a new uninitialized editable child collection instance.
     * <br/>_This method is called by the parent object._
     *
     * @function EditableChildCollection.empty
     * @protected
     * @param {object} parent - The parent business object.
     * @param {bo.common.EventHandlerList} [eventHandlers] - The event handlers of the instance.
     * @returns {Promise.<EditableChildCollection>} Returns a promise to the new editable child collection.
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
Object.freeze( EditableChildCollectionFactory );

export default EditableChildCollectionFactory;
