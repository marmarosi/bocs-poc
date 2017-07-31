/*
 * USAGE
 *
 * const Argument = require( './argument-check.js' );
 *
 * const check;
 * let value = ...;
 * const msg = 'Wrong argument!';
 *
 * // Single usage:
 * value = Argument.check( value ).for( VALUE_NAME ).asString( msg );
 * value = Argument.inConstructor( CLASS_NAME ).check( value ).for( VALUE_NAME ).asString( msg );
 * value = Argument.inMethod( CLASS_NAME, METHOD_NAME ).check( value ).for( VALUE_NAME ).asString( msg );
 * value = Argument.inProperty( CLASS_NAME, PROPERTY_NAME ).check( value ).for( VALUE_NAME ).asString( msg );
 *
 * // Multiple usage:
 * check = Argument();                                        // generic arguments
 * check = Argument.inConstructor( CLASS_NAME );              // constructor arguments
 * check = Argument.inMethod( CLASS_NAME, METHOD_NAME );      // method arguments
 * check = Argument.inProperty( CLASS_NAME, PROPERTY_NAME );  // property arguments
 *
 * value = check( value ).for( VALUE_NAME ).asString( msg );           // any or special argument
 * value = check( value ).forOptional( VALUE_NAME ).asString( msg );   // optional argument
 * value = check( value ).forMandatory( VALUE_NAME ).asString( msg );  // mandatory argument
 *
 * value = check( value ).forOptional( VALUE_NAME ).asType([ CollectionBase, ModelBase ], msg ); // additional attribute
 * value = check( value ).forMandatory( VALUE_NAME ).asType( UserInfo, msg ); // additional attribute
 *
 * value = check( value ).for( VALUE_NAME ).asEnumMember( Action, Action.Save, msg ); // two additional attributes
 */
"use strict";

//region Imports

import ArgumentError from './argument-error.js';
import ConstructorError from './constructor-error.js';
import MethodError from './method-error.js';
import PropertyError from './property-error.js';

//endregion

//region Argument group

const ArgumentGroup = {
  General: 0,
  Constructor: 1,
  Method: 2,
  Property: 3
};

//endregion

//region Argument check

/**
 * Creates an argument check instance for the given value.
 *
 * @memberof bo.system
 * @constructor
 * @param {*} [value] - The value to check.
 * @returns {bo.system.ArgumentCheck} The argument check instance.
 */
function ArgumentCheck( value ) {
  this.value = value;
  return this;
}

//endregion

//region Argument check builder

//region For

/**
 * Sets the name of the argument.
 *
 * @function bo.system.ArgumentCheck.for
 * @param {string} [argumentName] - The name of the argument.
 * @returns {bo.system.ArgumentCheck} The argument check instance.
 */
function forGeneric( argumentName ) {
  this.argumentName = argumentName || '';
  this.isMandatory = undefined;
  return this;
}

/**
 * Sets the name of the optional argument.
 *
 * @function bo.system.ArgumentCheck.forOptional
 * @param {string} [argumentName] - The name of the optional argument.
 * @returns {bo.system.ArgumentCheck} The argument check instance.
 */
function forOptional( argumentName ) {
  this.argumentName = argumentName || '';
  this.isMandatory = false;
  return this;
}

/**
 * Sets the name of the mandatory argument.
 *
 * @function bo.system.ArgumentCheck.forMandatory
 * @param {string} [argumentName] - The name of the mandatory argument.
 * @returns {bo.system.ArgumentCheck} The argument check instance.
 */
function forMandatory( argumentName ) {
  this.argumentName = argumentName || '';
  this.isMandatory = true;
  return this;
}

//endregion

//region Exception

function exception( defaultMessage, typeArgument, message, ...parameters ) {
  const args = [ null, message || defaultMessage || 'default' ];
  let type;
  switch (this.argumentGroup) {
    case ArgumentGroup.Property:
      type = PropertyError;
      args.push( this.className || '<class>', this.propertyName || '<property>' );
      break;
    case ArgumentGroup.Method:
      type = MethodError;
      args.push( this.className || '<class>', this.methodName || '<method>' );
      break;
    case ArgumentGroup.Constructor:
      type = ConstructorError;
      args.push( this.className || '<class>' );
      break;
    case ArgumentGroup.General:
    default:
      type = ArgumentError;
      break;
  }
  args.push( this.argumentName );
  if (typeArgument)
    args.push( typeArgument );
  if (parameters.length)
    parameters.forEach( function ( parameter ) {
      args.push( parameter );
    } );

  const error = type.bind( ...args );
  throw new error();
}

//endregion

//region General

/**
 * for: Checks if value is not undefined.
 *
 * @function bo.system.ArgumentCheck.asDefined
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {*} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be supplied.
 */
function asDefined( message, ...messageParams ) {
  if (this.value === undefined)
    this.exception( 'defined', null, message, ...messageParams );
  return this.value;
}

/**
 * for: Checks if value is not undefined and is not null.
 *
 * @function bo.system.ArgumentCheck.hasValue
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {*} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument is required.
 */
function hasValue( message, ...messageParams ) {
  if (this.value === null || this.value === undefined)
    this.exception( 'required', null, message, ...messageParams );
  return this.value;
}

//endregion

//region String

/**
 * for: Checks if value is a string.<br/>
 * forOptional: Checks if value is a string or null.<br/>
 * forMandatory: Checks if value is a non-empty string.
 *
 * @function bo.system.ArgumentCheck.asString
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(string|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a string value.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a string value or null.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a non-empty string.
 */
function asString( message, ...messageParams ) {
  switch (this.isMandatory) {
    case true:
      if (typeof this.value !== 'string' && !(this.value instanceof String) || this.value.trim().length === 0)
        this.exception( 'manString', null, message, ...messageParams );
      break;
    case false:
      if (this.value === undefined)
        this.value = null;
      if (this.value !== null && typeof this.value !== 'string' && !(this.value instanceof String))
        this.exception( 'optString', null, message, ...messageParams );
      break;
    default:
      if (typeof this.value !== 'string' && !(this.value instanceof String))
        this.exception( 'string', null, message, ...messageParams );
      break;
  }
  return this.value;
}

//endregion

//region Number

/**
 * forOptional: Checks if value is a number or null.<br/>
 * forMandatory: Checks if value is a number.
 *
 * @function bo.system.ArgumentCheck.asNumber
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(number|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a number value or null.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a number value.
 */
function asNumber( message, ...messageParams ) {
  if (this.isMandatory) {
    if (typeof this.value !== 'number' && !(this.value instanceof Number))
      this.exception( 'manNumber', null, message, ...messageParams );
  } else {
    if (this.value === undefined)
      this.value = null;
    if (this.value !== null && typeof this.value !== 'number' && !(this.value instanceof Number))
      this.exception( 'optNumber', null, message, ...messageParams );
  }
  return this.value;
}

//endregion

//region Integer

/**
 * forOptional: Checks if value is an integer or null.<br/>
 * forMandatory: Checks if value is an integer.
 *
 * @function bo.system.ArgumentCheck.asInteger
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(number|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be an integer value or null.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be an integer value.
 */
function asInteger( message, ...messageParams ) {
  if (this.isMandatory) {
    if (typeof this.value !== 'number' && !(this.value instanceof Number) || this.value % 1 !== 0)
      this.exception( 'manInteger', null, message, ...messageParams );
  } else {
    if (this.value === undefined)
      this.value = null;
    if (this.value !== null && (typeof this.value !== 'number' && !(this.value instanceof Number) || this.value % 1 !== 0))
      this.exception( 'optInteger', null, message, ...messageParams );
  }
  return this.value;
}

//endregion

//region Boolean

/**
 * forOptional: Checks if value is a Boolean or null.<br/>
 * forMandatory: Checks if value is a Boolean.
 *
 * @function bo.system.ArgumentCheck.asBoolean
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(boolean|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a Boolean value or null.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a Boolean value.
 */
function asBoolean( message, ...messageParams ) {
  if (this.isMandatory) {
    if (typeof this.value !== 'boolean' && !(this.value instanceof Boolean))
      this.exception( 'manBoolean', null, message, ...messageParams );
  } else {
    if (this.value === undefined)
      this.value = null;
    if (this.value !== null && typeof this.value !== 'boolean' && !(this.value instanceof Boolean))
      this.exception( 'optBoolean', null, message, ...messageParams );
  }
  return this.value;
}

//endregion

//region Object

/**
 * forOptional: Checks if value is an object or null.<br/>
 * forMandatory: Checks if value is an object.
 *
 * @function bo.system.ArgumentCheck.asObject
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(object|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be an object or null.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be an object.
 */
function asObject( message, ...messageParams ) {
  if (this.isMandatory) {
    if (typeof this.value !== 'object' || this.value === null)
      this.exception( 'manObject', null, message, ...messageParams );
  } else {
    if (this.value === undefined)
      this.value = null;
    if (typeof this.value !== 'object')
      this.exception( 'optObject', null, message, ...messageParams );
  }
  return this.value;
}

//endregion

//region Function

/**
 * forOptional: Checks if value is a function or null.<br/>
 * forMandatory: Checks if value is a function.
 *
 * @function bo.system.ArgumentCheck.asFunction
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(function|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a function or null.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a function.
 */
function asFunction( message, ...messageParams ) {
  if (this.isMandatory) {
    if (typeof this.value !== 'function')
      this.exception( 'manFunction', null, message, ...messageParams );
  } else {
    if (this.value === undefined)
      this.value = null;
    if (this.value !== null && typeof this.value !== 'function')
      this.exception( 'optFunction', null, message, ...messageParams );
  }
  return this.value;
}

//endregion

//region Type

function typeNames( types ) {
  let list = '<< no types >>';
  if (types.length) {
    list = types.map( function ( type ) {
      return type.name ? type.name : '-unknown-'
    } ).join( ' | ' );
  }
  return list;
}

/**
 * forOptional: Checks if value is a given type or null.<br/>
 * forMandatory: Checks if value is a given type.
 *
 * @function bo.system.ArgumentCheck.asType
 * @param {(constructor|Array.<constructor>)} type - The type that value must inherit.
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(object|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a TYPE object or null.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a TYPE object.
 */
function asType( type, message, ...messageParams ) {
  const self = this;
  const types = type instanceof Array ? type : [ type ];
  if (this.isMandatory) {
    if (!(types.some( option => {
        return self.value && (
          self.value instanceof option ||
          self.value.super_ === option ||
          self.value.__proto__ === option);
      } )))
      this.exception( 'manType', typeNames( types ), message, ...messageParams );
  } else {
    if (this.value === undefined)
      this.value = null;
    if (this.value !== null && !(types.some( function ( option ) {
        return self.value && (self.value instanceof option);
      } )))
      this.exception( 'optType', typeNames( types ), message, ...messageParams );
  }
  return this.value;
}

//endregion

//region Model

/**
 * for: Checks if value is an instance of a given model type.
 *
 * @function bo.system.ArgumentCheck.asModelType
 * @param {(constructor|Array.<constructor>)} model - The model type that value must be an instance of.
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {object} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be a model type.
 */
function asModelType( model, message, ...messageParams ) {
  const self = this;
  const models = model instanceof Array ? model : [ model ];
  if (!(models.some( function ( modelType ) {
      return self.value && self.value.constructor && self.value.constructor.modelType === modelType;
    } )))
    this.exception( 'modelType', models.join( ' | ' ), message, ...messageParams );
  return this.value;
}

//endregion

//region Enumeration

/**
 * for: Checks if value is member of a given enumeration.
 *
 * @function bo.system.ArgumentCheck.asEnumMember
 * @param {constructor} type - The type of the enumeration.
 * @param {number} [defaultValue] - The type of the enumeration.
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {number} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}: Type is not an enumeration type.
 * @throws {@link bo.system.ArgumentError Argument error}: The argument must be an enumeration type item.
 */
function asEnumMember( type, defaultValue, message, ...messageParams ) {

  if (!(type && type.hasMember && type.constructor &&
      Object.getPrototypeOf( type.constructor ) &&
      Object.getPrototypeOf( type.constructor ).name === 'Enumeration'))
    this.exception( 'enumType', type, message, ...messageParams );

  if ((this.value === null || this.value === undefined) && typeof defaultValue === 'number')
    this.value = defaultValue;
  if (!type.hasMember( this.value ))
    this.exception( 'enumMember', type.$name, message, ...messageParams );

  return this.value;
}

//endregion

//region Array

/**
 * forOptional: Checks if value is an array of a given type or null.<br/>
 * forMandatory: Checks if value is an array of a given type.
 *
 * @function bo.system.ArgumentCheck.asArray
 * @param {*} type - The type of the array items - a primitive type or a constructor.
 * @param {string} [message] - Human-readable description of the error.
 * @param {...*} [messageParams] - Optional interpolation parameters of the message.
 * @returns {(Array.<type>|null)} The checked value.
 *
 * @throws {@link bo.system.ArgumentError Argument error}:
 *      The argument must be an array of TYPE values, or a single TYPE value or null.
 * @throws {@link bo.system.ArgumentError Argument error}:
 *      The argument must be an array of TYPE objects, or a single TYPE object or null.
 * @throws {@link bo.system.ArgumentError Argument error}:
 *      The argument must be an array of TYPE values, or a single TYPE value.
 * @throws {@link bo.system.ArgumentError Argument error}:
 *      The argument must be an array of TYPE objects, or a single TYPE object.
 */
function asArray( type, message, ...messageParams ) {
  if (!this.isMandatory) {
    if (this.value === undefined || this.value === null)
      return [];
  }
  let msgKey;
  if (type === String || type === Number || type === Boolean) {
    msgKey = this.isMandatory ? 'manArrayPrim' : 'optArrayPrim';

    const typeName = type.name.toLowerCase();
    if (typeof this.value === typeName || this.value instanceof type)
      return [ this.value ];
    if (this.value instanceof Array && (!this.value.length || this.value.every( function ( item ) {
        return typeof item === typeName || item instanceof type;
      } )))
      return this.value;
  } else {
    msgKey = this.isMandatory ? 'manArray' : 'optArray';

    if (this.value instanceof type)
      return [ this.value ];
    if (this.value instanceof Array && (!this.value.length || this.value.every( function ( item ) {
        return item instanceof type;
      } )))
      return this.value;
  }
  this.exception( msgKey, type, message, ...messageParams );
}

//endregion

function ArgumentCheckBuilder( argumentGroup, className, methodName, propertyName ) {

  const builderBase = {

    argumentGroup: argumentGroup || ArgumentGroup.General,
    className: className || '',
    methodName: methodName || '',
    propertyName: propertyName || '',

    argumentName: '',
    isMandatory: undefined,

    for: forGeneric,
    forOptional: forOptional,
    forMandatory: forMandatory,

    exception: exception,

    asDefined: asDefined,
    hasValue: hasValue,
    asString: asString,
    asNumber: asNumber,
    asInteger: asInteger,
    asBoolean: asBoolean,
    asObject: asObject,
    asFunction: asFunction,
    asType: asType,
    asModelType: asModelType,
    asEnumMember: asEnumMember,
    asArray: asArray
  };

  const fnCheck = ArgumentCheck.bind( builderBase );

  fnCheck.check = function ( value ) {
    return this( value );
  };

  return fnCheck;
}

//endregion

//region Argument check factory

/**
 * Creates a general argument check object.
 * @function bo.system.Argument
 */
function ArgumentCheckFactory() {
  return ArgumentCheckBuilder( ArgumentGroup.General, '', '', '' );
}

/**
 * Creates a general argument check object.
 * @function bo.system.Argument.check
 * @param {*} value - The value to check.
 * @returns {bo.system.ArgumentCheck} - Argument check object.
 */
ArgumentCheckFactory.check = function ( value ) {
  return ArgumentCheckBuilder( ArgumentGroup.General, '', '', '' )( value );
};

/**
 * Creates a constructor argument check object.
 * @function bo.system.Argument.inConstructor
 * @param {string} className - The name of the class of the constructor.
 * @returns {bo.system.ArgumentCheck} - Argument check object.
 */
ArgumentCheckFactory.inConstructor = function ( className ) {
  return ArgumentCheckBuilder( ArgumentGroup.Constructor, className, '', '' );
};

/**
 * Creates a method argument check object.
 * @function bo.system.Argument.inMethod
 * @param {string} className - The name of the class of the method.
 * @param {string} methodName - The name of the method.
 * @returns {bo.system.ArgumentCheck} - Argument check object.
 */
ArgumentCheckFactory.inMethod = function ( className, methodName ) {
  return ArgumentCheckBuilder( ArgumentGroup.Method, className, methodName, '' );
};

/**
 * Creates a property argument check object.
 * @function bo.system.Argument.inProperty
 * @param {string} className - The name of the class of the property.
 * @param {string} propertyName - The name of the property.
 * @returns {bo.system.ArgumentCheck} - Argument check object.
 */
ArgumentCheckFactory.inProperty = function ( className, propertyName ) {
  return ArgumentCheckBuilder( ArgumentGroup.Property, className, '', propertyName );
};

//endregion

export default ArgumentCheckFactory;
