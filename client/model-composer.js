'use strict';

//region Imports

import EditableRootObject from './editable-root-object.js';
import EditableChildObject from './editable-child-object.js';
import EditableRootCollection from './editable-root-collection.js';
import EditableChildCollection from './editable-child-collection.js';
import ReadOnlyRootObject from './read-only-root-object.js';
import ReadOnlyChildObject from './read-only-child-object.js';
import ReadOnlyRootCollection from './read-only-root-collection.js';
import ReadOnlyChildCollection from './read-only-child-collection.js';
import CommandObject from './command-object.js';

import PropertyManager from './common/property-manager.js';
import RuleManager from './rules/rule-manager.js';
import ExtensionManager from './common/extension-manager.js';

import Action from './rules/authorization-action.js';
import cr from './common-rules/index.js';

import PropertyInfo from './common/property-info.js';
import dt from './data-types/index.js';

import ComposerError from './system/composer-error.js';

//endregion

//region Variables

const ArgsType = {
  businessObject: 0,
  rootCollection: 1,
  childCollection: 2
};

const _modelName = new WeakMap();

const _modelFactory = new WeakMap();
const _modelTypeName = new WeakMap();
const _memberType = new WeakMap();
const _argsType = new WeakMap();
const _isCollection = new WeakMap();
const _isRoot = new WeakMap();
const _isEditable = new WeakMap();

const _properties = new WeakMap();
const _rules = new WeakMap();
const _extensions = new WeakMap();
const _currentProperty = new WeakMap();

//endregion

//region Helper

function initialize( dataSource, modelPath ) {
  const argsType = _argsType.get( this );
  if (argsType === ArgsType.businessObject)
    _properties.set( this, new PropertyManager() );
  if (argsType !== ArgsType.childCollection) {
    _rules.set( this, new RuleManager() );
    _extensions.set( this, new ExtensionManager( dataSource, modelPath ) );
  }
  return this;
}

function addProperty( propertyName, propertyType, flags, getter, setter ) {
  const property = new PropertyInfo( propertyName, propertyType, flags, getter, setter );

  const properties = _properties.get( this );
  properties.add( property );
  _properties.set( this, properties );

  _currentProperty.set( this, property );
  return this;
}

function addValRule( ruleFactory, parameters ) {
  let args = Array.prototype.slice.call( parameters );
  args.unshift( _currentProperty.get( this ) );

  const rules = _rules.get( this );
  rules.add( ruleFactory.apply( null, args ) );
  _rules.set( this, rules );

  return this;
}

function addAuthRule( action, parameters ) {
  const args = Array.prototype.slice.call( parameters );
  const ruleFactory = args.shift();
  args.unshift( action, _currentProperty.get( this ) );

  const rules = _rules.get( this );
  rules.add( ruleFactory.apply( null, args ) );
  _rules.set( this, rules );

  return this;
}

function addObjRule( action, parameters ) {
  const args = Array.prototype.slice.call( parameters );
  const ruleFactory = args.shift();
  args.unshift( action, null );

  const rules = _rules.get( this );
  rules.add( ruleFactory.apply( null, args ) );
  _rules.set( this, rules );

  return nonProperty.call( this );
}

function nonProperty() {
  _currentProperty.delete( this );
  return this;
}

function inGroup1() {
  const self = this;
  return [ EditableRootObject, EditableChildObject, EditableRootCollection ]
    .some( function ( element ) {
      return element === _modelFactory.get( self );
    } );
}

function inGroup2() {
  return _isCollection.get( this ) && !_isRoot.get( this ) ||
    _modelFactory.get( this ) === CommandObject;
}

function inGroup3() {
  const mf = _modelFactory.get( this );
  return mf === EditableRootObject || mf === EditableChildObject;
}

function checkCurrentProperty( methodName ) {
  if (!_currentProperty.get( this )) {
    const modelName = _modelName.get( this );
    const error = new ComposerError( 'property', modelName, methodName );
    error.modelName = modelName;
    error.modelType = _modelTypeName.get( this );
    error.methodName = methodName;
    throw error;
  }
}

function invalid( methodName ) {
  const modelName = _modelName.get( this );
  const modelTypeName = _modelTypeName.get( this );
  const error = new ComposerError( 'invalid', modelName, methodName, modelTypeName );
  error.modelName = modelName;
  error.modelType = modelTypeName;
  error.methodName = methodName;
  throw error;
}

//endregion

/**
 * Represents a model composer to build asynchronous business objects.
 *
 * @name ModelComposer
 */
class ModelComposer {

  /**
   * Creates a new asynchronous model composer instance.
   *
   * @param {string} modelName - The name of the model to build.
   */
  constructor( modelName ) {
    _modelName.set( this, modelName );
  }

  //region Model types

  /**
   * Sets the type of the business object as editable root object.
   *
   * @function ModelComposer#editableRootObject
   * @param {string} dataSource - The identifier of the data source.
   * @param {string} modelPath - The path of the model definition.
   * @returns {ModelComposer} The model composer.
   */
  editableRootObject( dataSource, modelPath ) {
    _modelFactory.set( this, EditableRootObject );
    _modelTypeName.set( this, 'EditableRootObject' );
    _argsType.set( this, ArgsType.businessObject );
    _isCollection.set( this, false );
    _isRoot.set( this, true );
    _isEditable.set( this, true );
    return initialize.call( this, dataSource, modelPath );
  }

  /**
   * Sets the type of the business object as editable child object.
   *
   * @function ModelComposer#editableChildObject
   * @param {string} dataSource - The identifier of the data source.
   * @param {string} modelPath - The path of the model definition.
   * @returns {ModelComposer} The model composer.
   */
  editableChildObject( dataSource, modelPath ) {
    _modelFactory.set( this, EditableChildObject );
    _modelTypeName.set( this, 'EditableChildObject' );
    _argsType.set( this, ArgsType.businessObject );
    _isCollection.set( this, false );
    _isRoot.set( this, false );
    _isEditable.set( this, true );
    return initialize.call( this, dataSource, modelPath );
  }

  /**
   * Sets the type of the business object as read-only root object.
   *
   * @function ModelComposer#readOnlyRootObject
   * @param {string} dataSource - The identifier of the data source.
   * @param {string} modelPath - The path of the model definition.
   * @returns {ModelComposer} The model composer.
   */
  readOnlyRootObject( dataSource, modelPath ) {
    _modelFactory.set( this, ReadOnlyRootObject );
    _modelTypeName.set( this, 'ReadOnlyRootObject' );
    _argsType.set( this, ArgsType.businessObject );
    _isCollection.set( this, false );
    _isRoot.set( this, true );
    _isEditable.set( this, false );
    return initialize.call( this, dataSource, modelPath );
  }

  /**
   * Sets the type of the business object as read-only child object.
   *
   * @function ModelComposer#readOnlyChildObject
   * @param {string} dataSource - The identifier of the data source.
   * @param {string} modelPath - The path of the model definition.
   * @returns {ModelComposer} The model composer.
   */
  readOnlyChildObject( dataSource, modelPath ) {
    _modelFactory.set( this, ReadOnlyChildObject );
    _modelTypeName.set( this, 'ReadOnlyChildObject' );
    _argsType.set( this, ArgsType.businessObject );
    _isCollection.set( this, false );
    _isRoot.set( this, false );
    _isEditable.set( this, false );
    return initialize.call( this, dataSource, modelPath );
  }

  /**
   * Sets the type of the business object as editable root collection.
   *
   * @function ModelComposer#editableRootCollection
   * @param {string} dataSource - The identifier of the data source.
   * @param {string} modelPath - The path of the model definition.
   * @returns {ModelComposer} The model composer.
   */
  editableRootCollection( dataSource, modelPath ) {
    _modelFactory.set( this, EditableRootCollection );
    _modelTypeName.set( this, 'EditableRootCollection' );
    _argsType.set( this, ArgsType.rootCollection );
    _isCollection.set( this, true );
    _isRoot.set( this, true );
    _isEditable.set( this, true );
    return initialize.call( this, dataSource, modelPath );
  }

  /**
   * Sets the type of the business object as editable child collection.
   *
   * @function ModelComposer#editableChildCollection
   * @returns {ModelComposer} The model composer.
   */
  editableChildCollection() {
    _modelFactory.set( this, EditableChildCollection );
    _modelTypeName.set( this, 'EditableChildCollection' );
    _argsType.set( this, ArgsType.childCollection );
    _isCollection.set( this, true );
    _isRoot.set( this, false );
    _isEditable.set( this, true );
    return initialize.call( this );
  }

  /**
   * Sets the type of the business object as read-only root collection.
   *
   * @function ModelComposer#readOnlyRootCollection
   * @param {string} dataSource - The identifier of the data source.
   * @param {string} modelPath - The path of the model definition.
   * @returns {ModelComposer} The model composer.
   */
  readOnlyRootCollection( dataSource, modelPath ) {
    _modelFactory.set( this, ReadOnlyRootCollection );
    _modelTypeName.set( this, 'ReadOnlyRootCollection' );
    _argsType.set( this, ArgsType.rootCollection );
    _isCollection.set( this, true );
    _isRoot.set( this, true );
    _isEditable.set( this, false );
    return initialize.call( this, dataSource, modelPath );
  }

  /**
   * Sets the type of the business object as read-only child collection.
   *
   * @function ModelComposer#readOnlyChildCollection
   * @returns {ModelComposer} The model composer.
   */
  readOnlyChildCollection() {
    _modelFactory.set( this, ReadOnlyChildCollection );
    _modelTypeName.set( this, 'ReadOnlyChildCollection' );
    _argsType.set( this, ArgsType.childCollection );
    _isCollection.set( this, true );
    _isRoot.set( this, false );
    _isEditable.set( this, false );
    return initialize.call( this );
  }

  /**
   * Sets the type of the business object as command object.
   *
   * @function ModelComposer#commandObject
   * @param {string} dataSource - The identifier of the data source.
   * @param {string} modelPath - The path of the model definition.
   * @returns {ModelComposer} The model composer.
   */
  commandObject( dataSource, modelPath ) {
    _modelFactory.set( this, CommandObject );
    _modelTypeName.set( this, 'CommandObject' );
    _argsType.set( this, ArgsType.businessObject );
    _isCollection.set( this, false );
    _isRoot.set( this, true );
    _isEditable.set( this, true );
    return initialize.call( this, dataSource, modelPath );
  }

  //endregion

  //region Collections

  /**
   * Defines the model type of the elements in a collection.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildCollection}
   *      * {@link ReadOnlyRootCollection}
   *      * {@link ReadOnlyChildCollection}
   *
   * @function ModelComposer#itemType
   * @param {function} itemType - The model type of the collection elements.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  itemType( itemType ) {
    if (!_isCollection.get( this ))
      invalid.call( this, 'itemType' );
    _memberType.set( this, itemType );
    return this;
  }

  //endregion

  //region Properties

  /**
   * Defines a Boolean property for the business object.
   * See {@link bo.dataTypes.Boolean Boolean} data type.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#boolean
   * @param {string} propertyName - The name of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  boolean( propertyName, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'boolean' );
    return addProperty.call( this, propertyName, dt.Boolean, flags, getter, setter );
  }

  /**
   * Defines a text property for the business object.
   * See {@link bo.dataTypes.Text text} data type.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#text
   * @param {string} propertyName - The name of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  text( propertyName, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'text' );
    return addProperty.call( this, propertyName, dt.Text, flags, getter, setter );
  }

  /**
   * Defines an e-mail address property for the business object.
   * See {@link bo.dataTypes.Email e-mail} data type.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#email
   * @param {string} propertyName - The name of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  email( propertyName, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'email' );
    return addProperty.call( this, propertyName, dt.Email, flags, getter, setter );
  }

  /**
   * Defines an integer property for the business object.
   * See {@link bo.dataTypes.Integer integer} data type.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#integer
   * @param {string} propertyName - The name of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  integer( propertyName, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'integer' );
    return addProperty.call( this, propertyName, dt.Integer, flags, getter, setter );
  }

  /**
   * Defines a decimal property for the business object.
   * See {@link bo.dataTypes.Decimal decimal} data type.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#decimal
   * @param {string} propertyName - The name of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  decimal( propertyName, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'decimal' );
    return addProperty.call( this, propertyName, dt.Decimal, flags, getter, setter );
  }

  /**
   * Defines an enumeration property for the business object.
   * See {@link bo.dataTypes.Enum enumeration} data type.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#enum
   * @param {string} propertyName - The name of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  enum( propertyName, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'enum' );
    return addProperty.call( this, propertyName, dt.Enum, flags, getter, setter );
  }

  /**
   * Defines a date-time property for the business object.
   * See {@link bo.dataTypes.DateTime date-time} data type.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#dateTime
   * @param {string} propertyName - The name of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  dateTime( propertyName, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'dateTime' );
    return addProperty.call( this, propertyName, dt.DateTime, flags, getter, setter );
  }

  /**
   * Defines a general property for the business object.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#property
   * @param {string} propertyName - The name of the property.
   * @param {function} typeCtor - The data type of the property.
   * @param {bo.common.PropertyFlag} [flags] - Other attributes of the property.
   * @param {external.propertyGetter} [getter] - Custom function to read the value of the property.
   * @param {external.propertySetter} [setter] - Custom function to write the value of the property.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  property( propertyName, typeCtor, flags, getter, setter ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'property' );
    return addProperty.call( this, propertyName, typeCtor, flags, getter, setter );
  }

  //endregion

  //region Property rules - validation

  /**
   * Adds a required rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#required
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=50] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  required( message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'required' );
    checkCurrentProperty.call( this, 'required' );
    return addValRule.call( this, cr.required, arguments );
  }

  /**
   * Adds a maximum length rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#maxLength
   * @param {number} maxLength - The maximum length of the property value.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  maxLength( maxLength, message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'maxLength' );
    checkCurrentProperty.call( this, 'maxLength' );
    return addValRule.call( this, cr.maxLength, arguments );
  }

  /**
   * Adds a minimum length rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#minLength
   * @param {number} minLength - The minimum length of the property value.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  minLength( minLength, message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'minLength' );
    checkCurrentProperty.call( this, 'minLength' );
    return addValRule.call( this, cr.minLength, arguments );
  }

  /**
   * Adds a required length rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#lengthIs
   * @param {number} length - The required length of the property value.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  lengthIs( length, message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'lengthIs' );
    checkCurrentProperty.call( this, 'lengthIs' );
    return addValRule.call( this, cr.lengthIs, arguments );
  }

  /**
   * Adds a maximum value rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#maxValue
   * @param {number} maxValue - The maximum value of the property value.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  maxValue( maxValue, message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'maxValue' );
    checkCurrentProperty.call( this, 'maxValue' );
    return addValRule.call( this, cr.maxValue, arguments );
  }

  /**
   * Adds a minimum value rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#minValue
   * @param {number} minValue - The minimum value of the property value.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  minValuefunction( minValue, message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'minValue' );
    checkCurrentProperty.call( this, 'minValue' );
    return addValRule.call( this, cr.minValue, arguments );
  }

  /**
   * Adds an expression rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#expression
   * @param {regexp} regex - The regular expression that specifies the rule.
   * @param {bo.commonRules.NullResultOption} option - The action to execute when the value is null.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=10] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  expression( regex, option, message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'expression' );
    checkCurrentProperty.call( this, 'expression' );
    return addValRule.call( this, cr.expression, arguments );
  }

  /**
   * Adds a dependency rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#dependency
   * @param {(bo.common.PropertyInfo|Array.<bo.common.PropertyInfo>)} dependencies -
   *    A single dependent property or an array of them.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority=-100] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  dependency( dependencies, message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'dependency' );
    checkCurrentProperty.call( this, 'dependency' );
    return addValRule.call( this, cr.dependency, arguments );
  }

  /**
   * Adds an information rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#information
   * @param {string} message - The information to display.
   * @param {number} [priority=1] - The priority of the rule.
   * @param {boolean} [stopsProcessing=false] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  information( message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'information' );
    checkCurrentProperty.call( this, 'information' );
    return addValRule.call( this, cr.information, arguments );
  }

  /**
   * Adds a validation rule to the current property.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject} - allowed but rarely used
   *      * {@link ReadOnlyChildObject} - allowed but rarely used
   *      * {@link CommandObject}
   *
   * @function ModelComposer#validate
   * @param {function} ruleFactory - A factory function that return the
   *    {@link bo.rules.ValidationRule validation rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the validation rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  validate( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'validate' );
    checkCurrentProperty.call( this, 'validate' );
    const args = Array.prototype.slice.call( parameters, 1 );
    args.unshift( _currentProperty.get( this ) );
    const rules = _rules.get( this );
    rules.add( ruleFactory.apply( null, args ) );
    _rules.set( this, rules );
    return this;
  }

  //endregion

  //region Property rules - authorization

  /**
   * Adds an authorization rule to the current property that determines
   * whether the user can read it.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#canRead
   * @param {function} ruleFactory - A factory function that return the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  canRead( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'canRead' );
    checkCurrentProperty.call( this, 'canRead' );
    return addAuthRule.call( this, Action.readProperty, arguments );
  }

  /**
   * Adds an authorization rule to the current property that determines
   * whether the user can write it.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#canWrite
   * @param {function} ruleFactory - A factory function that return the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   * @throws {@link bo.system.ComposerError Composer error}: The current property is undefinable.
   */
  canWrite( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (_isCollection.get( this ) || !_isEditable.get( this ))
      invalid.call( this, 'canWrite' );
    checkCurrentProperty.call( this, 'canWrite' );
    return addAuthRule.call( this, Action.writeProperty, arguments );
  }

  //endregion

  //region Object rules

  /**
   * Adds an authorization rule to the business object that determines
   * whether the user can create e new instance of it.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildObject}
   *
   * @function ModelComposer#canCreate
   * @param {function} ruleFactory - A factory function that returns the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  canCreate( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (!inGroup1.call( this ))
      invalid.call( this, 'canCreate' );
    return addObjRule.call( this, Action.createObject, arguments );
  }

  /**
   * Adds an authorization rule to the business object that determines
   * whether the user can retrieve instances of it.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyRootCollection}
   *      * {@link ReadOnlyChildObject}
   *
   * @function ModelComposer#canFetch
   * @param {function} ruleFactory - A factory function that returns the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  canFetch( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (inGroup2.call( this ))
      invalid.call( this, 'canFetch' );
    return addObjRule.call( this, Action.fetchObject, arguments );
  }

  /**
   * Adds an authorization rule to the business object that determines
   * whether the user can update its instances.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildObject}
   *
   * @function ModelComposer#canUpdate
   * @param {function} ruleFactory - A factory function that returns the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  canUpdate( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (!inGroup1.call( this ))
      invalid.call( this, 'canUpdate' );
    return addObjRule.call( this, Action.updateObject, arguments );
  }

  /**
   * Adds an authorization rule to the business object that determines
   * whether the user can delete its instances.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildObject}
   *
   * @function ModelComposer#canRemove
   * @param {function} ruleFactory - A factory function that returns the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  canRemove( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (!inGroup1.call( this ))
      invalid.call( this, 'canRemove' );
    return addObjRule.call( this, Action.removeObject, arguments );
  }

  /**
   * Adds an authorization rule to the business object that determines
   * whether the user can execute a command.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model type:
   *
   *      * {@link CommandObject}
   *
   * @function ModelComposer#canExecute
   * @param {function} ruleFactory - A factory function that returns the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  canExecute( ruleFactory, [params], message, priority, stopsProcessing ) {
    if (_modelFactory.get( this ) !== CommandObject)
      invalid.call( this, 'canExecute' );
    return addObjRule.call( this, Action.executeCommand, arguments );
  }

  /**
   * Adds an authorization rule to the business object that determines
   * whether the user can execute a custom fetch or a custom execute command.
   * See {@link bo.commonRules common rules} to find authorization ones.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyRootCollection}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#canCall
   * @param {string} methodName - The name of the custom method to execute.
   * @param {function} ruleFactory - A factory function that returns the
   *    {@link bo.rules.AuthorizationRule authorization rule} to add.
   * @param {*} [&hellip;params] - Optional parameters depending on the authorization rule.
   * @param {string} message - Human-readable description of the rule failure.
   * @param {number} [priority] - The priority of the rule.
   * @param {boolean} [stopsProcessing] - Indicates the rule behavior in case of failure.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  canCall( methodName, ruleFactory, [params], message, priority, stopsProcessing ) {
    if (_isCollection.get( this ) && !_isRoot.get( this ))
      invalid.call( this, 'canCall' );

    const args = Array.prototype.slice.call( arguments, 2 );
    args.unshift( Action.executeMethod, methodName );

    const rules = _rules.get( this );
    rules.add( ruleFactory.apply( null, args ) );
    _rules.set( this, rules );

    return nonProperty.call( this );
  }

  //endregion

  //region Extensions

  /**
   * Adds a custom function to the business object that creates
   * the API client object of the model instance.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyRootCollection}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#acoBuilder
   * @param {function} acoBuilder - A factory function that returns an
   *    {@link bo.apiAccess.apiClientBase API client object} for the model instance.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  acoBuilder( acoBuilder ) {
    if (!_isRoot.get( this ) && _modelFactory.get( this ) !== EditableChildObject)
      invalid.call( this, 'acoBuilder' );
    const extensions = _extensions.get( this );
    extensions.acoBuilder = acoBuilder;
    _extensions.set( this, extensions );
    return nonProperty.call( this );
  }

  /**
   * Adds a custom function to the business object that converts
   * the model instance to data transfer object.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableRootCollection}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyRootCollection}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#toDto
   * @param {function} toDto - A factory function that converts
   *    the model instance to data transfer object.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  toDto( toDto ) {
    if (!_isEditable.get( this ) || _isCollection.get( this ))
      invalid.call( this, 'toDto' );
    const extensions = _extensions.get( this );
    extensions.toDto = toDto;
    _extensions.set( this, extensions );
    return nonProperty.call( this );
  }

  /**
   * Adds a custom function to the business object that converts
   * the data transfer object to model instance.
   *
   *    The function is valid for the following model types:
   *
   *      * {@link EditableRootObject}
   *      * {@link EditableChildObject}
   *      * {@link ReadOnlyRootObject}
   *      * {@link ReadOnlyChildObject}
   *      * {@link CommandObject}
   *
   * @function ModelComposer#fromDto
   * @param {function} fromDto - A factory function that converts
   *    the data transfer object to model instance.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  fromDto( fromDto ) {
    if (_isCollection.get( this ))
      invalid.call( this, 'fromDto' );
    const extensions = _extensions.get( this );
    extensions.fromDto = fromDto;
    _extensions.set( this, extensions );
    return nonProperty.call( this );
  }

  /**
   * Adds a new instance method to the business object that
   * will call a custom execute method on a command object instance.
   * See {@link bo.common.ExtensionManager#addOtherMethod addOtherMethod}
   * method of ExtensionManagerBase class.
   *
   *    The function is valid for the following model type:
   *
   *      * {@link CommandObject}
   *
   * @function ModelComposer#addMethod
   * @param {string} methodName - The name of the method on the data access object to be called.
   * @param {string} [wpAltName] - Optional alternative method name for the web portal.
   * @returns {ModelComposer}
   *
   * @throws {@link bo.system.ComposerError Composer error}: The function is not applicable to the model type.
   */
  addMethod( methodName, wpAltName ) {
    if (_modelFactory.get( this ) !== CommandObject)
      invalid.call( this, 'addMethod' );
    const extensions = _extensions.get( this );
    extensions.addOtherMethod( methodName, wpAltName );
    _extensions.set( this, extensions );
    return nonProperty.call( this );
  }

  //endregion

  compose() {
    const modelFactory = _modelFactory.get( this );
    const modelName = _modelName.get( this );
    const properties = _properties.get( this );
    const rules = _rules.get( this );
    const extensions = _extensions.get( this );
    const memberType = _memberType.get( this );

    switch (_argsType.get( this )) {
      case ArgsType.businessObject:
        return new modelFactory( modelName, properties, rules, extensions );
      case ArgsType.rootCollection:
        return new modelFactory( modelName, memberType, rules, extensions );
      case ArgsType.childCollection:
        return new modelFactory( modelName, memberType );
    }
  }
}

export default ModelComposer;
