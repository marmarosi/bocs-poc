'use strict';

//region Imports

import Argument from '../system/argument-check.js';
import MethodError from '../system/method-error.js';
import PropertyInfo from './property-info.js';
import DataType from '../data-types/data-type.js';
import ModelError from './model-error.js';

//endregion

//region Private variables

const _items = new WeakMap();
const _changed = new WeakMap(); // for children
const _children = new WeakMap();
const _isFrozen = new WeakMap();
const _modelName = new WeakMap();

//endregion

//region Helper methods

function checkChildren() {
  if (_changed.get( this )) {
    const items = _items.get( this );
    const children = items.filter( item => {
      return !(item.type instanceof DataType);
    } );
    _children.set( this, children );
    _changed.set( this, false );
  }
}

//endregion

/**
 * Provides methods to manage the properties of a business object model.
 *
 * @memberof bo.common
 */
class PropertyManager {

  //region Constructor

  /**
   * Creates a new property manager object.
   *
   * @param {Array.<bo.common.PropertyInfo>} [properties] - Description of a model property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property must be PropertyInfo object.
   */
  constructor( ...properties ) {

    const check = Argument.inConstructor( PropertyManager.name );
    const items = [];
    let changed = false;

    if (properties) {
      properties.forEach( property => {
        items.push( check( property ).forMandatory().asType( PropertyInfo, 'properties' ) );
        changed = true;
      } );
    }

    _items.set( this, items );
    _changed.set( this, changed );
    _children.set( this, [] );
    _isFrozen.set( this, false );
    _modelName.set( this, PropertyManager.name );

    // Immutable object.
    Object.freeze( this );
  }

  //endregion

  //region Properties

  /**
   * The name of the model.
   * @member {string} bo.common.PropertyManager#modelName
   */
  get modelName() {
    return _modelName.get( this );
  }

  set modelName( value ) {
    const modelName = Argument.inProperty( PropertyManager.name, 'modelName' )
      .check( value ).forMandatory().asString();
    _modelName.set( this, modelName );
  }

  //endregion

  //region Item management

  /**
   * Adds a new property to the business object model.
   *
   * @param {bo.common.PropertyInfo} property - Description of the model property to add.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property must be PropertyInfo object.
   * @throws {@link bo.common.ModelError Model error}: Cannot change the definition after creation.
   */
  add( property ) {
    if (_isFrozen.get( this ))
      throw new ModelError( 'frozen', this.modelName );

    property = Argument.inMethod( PropertyManager.name, 'add' )
      .check( property ).forMandatory( 'property' ).asType( PropertyInfo );

    const items = _items.get( this );
    items.push( property );
    _items.set( this, items );

    _changed.set( this, true );
  }

  /**
   * Creates a new property for the business object model.
   *    </br></br>
   * The data type can be any one from the {@link bo.dataTypes} namespace
   * or a custom data type based on {@link bo.dataTypes.DataType DataType} object,
   * or can be any business object model or collection defined by the
   * model types available in the {@link bo} namespace (i.e. models based on
   * {@link ModelBase ModelBase} or {@link CollectionBase CollectionBase}
   * objects).
   *    </br></br>
   * The flags parameter is ignored when data type is a model or collection.
   *
   * @param {string} name - The name of the property.
   * @param {*} type - The data type of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @returns {bo.common.PropertyInfo} The definition of the property.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The type must be a data type, a model or a collection.
   * @throws {@link bo.system.ArgumentError Argument error}: The flags must be PropertyFlag items.
   * @throws {@link bo.common.ModelError Model error}: Cannot change the definition after creation.
   */
  create( name, type, flags ) {
    if (_isFrozen.get( this ))
      throw new ModelError( 'frozen', this.modelName );

    const property = new PropertyInfo( name, type, flags );

    const items = _items.get( this );
    items.push( property );
    _items.set( this, items );

    _changed.set( this, true );

    return property;
  }

  /**
   * Determines whether a property belongs to the business object model.
   *
   * @param {bo.common.PropertyInfo} property - Property definition to be checked.
   * @returns {boolean} True if the model contains the property, otherwise false.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The property must be PropertyInfo object.
   */
  contains( property ) {
    property = Argument.inMethod( PropertyManager.name, 'contains' )
      .check( property ).forMandatory( 'property' ).asType( PropertyInfo );

    return _items.get( this )
      .some( function ( item ) {
        return item.name === property.name;
      } );
  }

  /**
   * Gets the property with the given name.
   *
   * @param {string} name - The name of the property.
   * @param {string} [message] - The error message in case of not finding the property.
   * @returns {bo.common.PropertyInfo} The requested property definition.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
   * @throws {@link bo.system.ArgumentError Argument error}: The business object has no property
   *    with the given name.
   */
  getByName( name, message ) {
    name = Argument.inMethod( PropertyManager.name, 'getByName' )
      .check( name ).forMandatory( 'name' ).asString();

    const items = _items.get( this );
    for (let i = 0; i < items.length; i++) {
      if (items[ i ].name === name)
        return items[ i ];
    }
    throw new MethodError( message || 'noProperty',
      PropertyManager.name, 'getByName', 'name', this.modelName, name );
  }

  /**
   * Gets the property definitions of the business object model as an array.
   *
   * @returns {Array.<bo.common.PropertyInfo>} The array of model properties.
   */
  toArray() {
    return _items.get( this )
      .filter( function ( item ) {
        return item.type instanceof DataType;
      } );
  }

  //endregion

  //region Public array methods

  /**
   * Executes the provided function once per property definition.
   *
   * @param {external.cbCollectionItem} callback - Function that produces an element
   *    of the model properties, taking three arguments: property, index, array.
   */
  forEach( callback ) {
    _items.get( this ).forEach( callback );
  }

  /**
   * Creates a new array with all properties that pass the test implemented by the provided function.
   *
   * @param {external.cbCollectionItem} callback - Function to test each element of the properties,
   *    taking three arguments: property, index, array.
   *    Return true to keep the property definition, false otherwise.
   * @returns {Array.<bo.common.PropertyInfo>} A new array with all properties that passed the test.
   */
  filter( callback ) {
    return _items.get( this ).filter( callback );
  }

  /**
   * Creates a new array with the results of calling a provided function
   * on every element of the model properties.
   *
   * @param {external.cbCollectionItem} callback - Function that produces an element of the new array,
   *    taking three arguments: property, index, array.
   * @returns {Array} A new array with items produced by the function.
   */
  map( callback ) {
    return _items.get( this ).map( callback );
  }

  //endregion

  //region Children

  /**
   * Gets the child objects and collections of the current model.
   *
   * @returns {Array.<bo.common.PropertyInfo>} - The array of the child properties.
   */
  children() {
    checkChildren.call( this );
    return _children.get( this );
  }

  /**
   * Gets the count of the child objects and collections of the current model.
   *
   * @returns {Number} The count of the child properties.
   */
  childCount() {
    checkChildren.call( this );
    return _children.get( this ).length;
  }

  /**
   * Verifies the model types of child objects and freezes properties of the model.
   *
   * @param {Array.<string>} allowedTypes - The names of the model types of the allowed child objects.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The allowed types must be
   *      an array of string values or a single string value.
   * @throws {@link bo.common.ModelError Model error}: The type of a model property
   *      should be an allowed type.
   */
  verifyChildTypes( allowedTypes ) {
    allowedTypes = Argument.inMethod( PropertyManager.name, 'verifyChildTypes' )
      .check( allowedTypes ).forMandatory( 'allowedTypes' ).asArray( String );

    checkChildren.call( this );

    let children = _children.get( this );

    children.forEach( child => {
      if (!(allowedTypes.some( allowedType => {
          return child.type.modelType == allowedType;
        } ))) {
        const childType = (child.type && child.type.modelType) ? child.type.modelType : typeof child;
        throw new ModelError( 'invalidChild',
          this.modelName, child.name, childType, allowedTypes.join( ' | ' ) );
      }
    } );

    _isFrozen.set( this, true );
  };

  //endregion

  //region Keys

  /**
   * Gets the key of the current model.
   *    </br></br>
   * If the model has no key properties, the method returns the data transfer object,
   * If the model has one key property, then it returns the current value of the that property.
   * If the model has more key properties, an object will be returned whose properties will hold
   * the current values of the key properties.
   *
   * @protected
   * @param {internal~getValue} getPropertyValue - A function that returns
   *    the current value of the given property.
   * @returns {*} The key value of the model.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The getPropertyValue argument must be a function.
   */
  getKey( getPropertyValue ) {

    getPropertyValue = Argument.inMethod( PropertyManager.name, 'getKey' )
      .check( getPropertyValue ).forMandatory( 'getPropertyValue' ).asFunction();

    // No properties - no keys.
    const items = _items.get( this );
    if (!items.length)
      return undefined;

    let key;
    // Get key properties.
    const keys = items.filter( item => {
      return item.isKey;
    } );
    // Evaluate result.
    switch (keys.length) {
      case 0:
        // No keys: dto will be used.
        key = {};
        items.forEach( item => {
          key[ item.name ] = getPropertyValue( item );
        } );
        break;
      case 1:
        // One key: key value will be used.
        key = getPropertyValue( keys[ 0 ] );
        break;
      default:
        // More keys: key object will be used.
        key = {};
        keys.forEach( item => {
          key[ item.name ] = getPropertyValue( item );
        } );
    }
    return key;
  }

  /**
   * Determines that the passed data contains current values of the model key.
   *
   * @protected
   * @param {object} data - Data object whose properties can contain the values of the model key.
   * @param {internal~getValue} getPropertyValue - A function that returns
   *    the current value of the given property.
   * @returns {boolean} True when the values are equal, false otherwise.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The data argument must be an object.
   * @throws {@link bo.system.ArgumentError Argument error}: The getPropertyValue argument must be a function.
   */
  keyEquals( data, getPropertyValue ) {
    const check = Argument.inMethod( PropertyManager.name, 'keyEquals' );

    data = check( data ).forMandatory( 'data' ).asObject();
    getPropertyValue = check( getPropertyValue ).forMandatory( 'getPropertyValue' ).asFunction();

    // Get key properties.
    const items = _items.get( this );
    const keys = items.filter( item => {
      return item.isKey;
    } );

    // Get key values.
    const values = new Map();
    if (keys.length) {
      keys.forEach( item => {
        values.set( item.name, getPropertyValue( item ) );
      } );
    } else {
      items.forEach( item => {
        values.set( item.name, getPropertyValue( item ) );
      } );
    }

    // Compare values.
    for (const [propertyName, propertyValue] of values.entries()) {
      if (data[ propertyName ] === undefined || data[ propertyName ] !== propertyValue)
        return false;
    }
    return true;
  }

  //endregion
}

export default PropertyManager;
