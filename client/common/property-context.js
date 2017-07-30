'use strict';

//region Ipmorts

import Argument from '../system/argument-check.js';
import ModelError from './model-error.js';
import PropertyInfo from './property-info.js';

//endregion

//region Private variables

const _getValue = new WeakMap();
const _setValue = new WeakMap();
const _primaryProperty = new WeakMap();

//endregion

//region Helper methods

function getByName( name ) {
    for (let i = 0; i < this.properties.length; i++) {
        if (this.properties[ i ].name === name)
            return this.properties[ i ];
    }
    throw new ModelError( 'noProperty', this.modelName, name );
}

//endregion

/**
 * Provides the context for custom property functions.
 *
 * @memberof bo.common
 */
class PropertyContext {

    //region Constructor

    /**
     * Creates a new property context object.
     *   </br></br>
     * <i><b>Warning:</b> Property context objects are created in models internally.
     * They are intended only to make publicly available the context
     * for custom property functions.</i>
     *
     * @param {string} modelName - The name of the business object model.
     * @param {Array.<bo.common.PropertyInfo>} properties - An array of property definitions.
     * @param {internal~getValue} [getValue] - A function that returns the current value of a property.
     * @param {internal~setValue} [setValue] - A function that changes the current value of a property.
     *
     * @throws {@link bo.system.ArgumentError Argument error}: The model name must be a non-empty string.
     * @throws {@link bo.system.ArgumentError Argument error}: The properties must be an array
     *    of PropertyInfo objects, or a single PropertyInfo object or null.
     * @throws {@link bo.system.ArgumentError Argument error}: The getValue argument must be a function.
     * @throws {@link bo.system.ArgumentError Argument error}: The setValue argument must be a function.
     */
    constructor( modelName, properties, getValue, setValue ) {
        const check = Argument.inConstructor( PropertyContext.name );

        /**
         * The name of the business object model.
         * @member {string} bo.common.PropertyContext#modelName
         * @readonly
         */
        this.modelName = check( modelName ).forMandatory( 'modelName' ).asString();

        /**
         * Array of property definitions that may used by the custom function.
         * @member {Array.<bo.common.PropertyInfo>} bo.common.PropertyContext#properties
         * @readonly
         */
        this.properties = check( properties ).forOptional( 'properties' ).asArray( PropertyInfo );

        _getValue.set( this, check( getValue ).forOptional( 'getValue' ).asFunction() );
        _setValue.set( this, check( setValue ).forOptional( 'setValue' ).asFunction() );
        _primaryProperty.set( this, null );

        // Immutable object.
        Object.freeze( this );
    }

    //endregion

    //region Properties

    /**
     * The primary property of the custom function.
     * @member {bo.common.PropertyInfo} bo.common.PropertyContext#primaryProperty
     * @readonly
     */
    get primaryProperty() {
        return _primaryProperty.get( this );
    }

    //endregion

    //region Methods

    /**
     * Sets the primary property of the custom function.
     *
     * @param {bo.common.PropertyInfo} property - The primary property of the custom function.
     * @returns {bo.common.PropertyContext} The property context object itself.
     */
    with( property ) {
        _primaryProperty.set( this, Argument.inMethod( PropertyContext.name, 'with' )
            .check( property ).forMandatory( 'property' ).asType( PropertyInfo ) );
        return this;
    }

    /**
     * Gets the current value of a model property.
     *
     * @param {string} propertyName - The name of the property.
     * @returns {*} The value of the model property.
     *
     * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
     * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
     * @throws {@link bo.common.ModelError Model error}: The property cannot be read.
     */
    getValue( propertyName ) {
        propertyName = Argument.inMethod( PropertyContext.name, 'getValue' )
            .check( propertyName ).forMandatory( 'propertyName' ).asString();
        const getValue = _getValue.get( this );
        if (getValue)
            return getValue( getByName.call( this, propertyName ) );
        else
            throw new ModelError( 'readProperty', this.modelName, propertyName );
    }

    /**
     * Sets the current value of a model property.
     *
     * @param {string} propertyName - The name of the property.
     * @param {*} value - The new value of the property.
     *
     * @throws {@link bo.system.ArgumentError Argument error}: The name must be a non-empty string.
     * @throws {@link bo.system.ArgumentError Argument error}: The model has no property with the given name.
     * @throws {@link bo.common.ModelError Model error}: The property cannot be written.
     */
    setValue( propertyName, value ) {
        propertyName = Argument.inMethod( PropertyContext.name, 'setValue' )
            .check( propertyName ).forMandatory( 'propertyName' ).asString();
        const setValue = _setValue.get( this );
        if (setValue) {
            if (value !== undefined)
                setValue( getByName.call( this, propertyName ), value );
        } else
            throw new ModelError( 'writeProperty', this.modelName, propertyName );
    }

    //endregion
}

export default PropertyContext;
