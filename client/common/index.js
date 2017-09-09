'use strict';

//region Imports

import ModelType from './model-type.js';
import ModelBase from './model-base.js';
import CollectionBase from './collection-base.js';

import ExtensionManager from './extension-manager.js';
import DataStore from './data-store.js';
import ModelState from './model-state.js';
import ModelError from './model-error.js';

import PropertyInfo from './property-info.js';
import PropertyFlag from './property-flag.js';
import PropertyManager from './property-manager.js';
import PropertyContext from './property-context.js';
import ClientTransferContext from './client-transfer-context.js';
import DataTransferContext from './data-transfer-context.js';

//endregion

/**
 * Contains components used by models, collections and other components.
 *
 * @namespace bo.common
 *
 * @property {function} ModelType - {@link bo.common.ModelType Model type}
 *      object specifies the types of the models and collections.
 * @property {function} ModelBase - {@link bo.common.ModelBase Model base}
 *      serves as the base class for models.
 * @property {function} CollectionBase - {@link bo.common.CollectionBase Collection base}
 *      serves as the base class for collections.
 *
 * @property {function} ExtensionManager - {@link bo.common.ExtensionManager Extension manager}
 *      constructor to create new a new extension manager object.
 * @property {function} DataStore - {@link bo.common.DataStore DataStore}
 *      constructor to create new data store.
 * @property {object} ModelState - {@link bo.rules.ModelState Model state}
 *      object specifies the possible states of the editable models.
 * @property {function} ModelError - {@link bo.common.ModelError Model error}
 *      constructor to create a new error related to a model.
 *
 * @property {function} PropertyInfo - {@link bo.common.PropertyInfo Property definition}
 *      constructor to create new property definition.
 * @property {function} PropertyFlag - {@link bo.common.PropertyFlag Property flag}
 *      constructor to create new flag set for a property definition.
 * @property {function} PropertyManager - {@link bo.common.PropertyManager Property manager}
 *      constructor to create a new property manager.
 * @property {function} PropertyContext - {@link bo.common.PropertyContext Property context}
 *      constructor to create new context object for custom property functions.
 * @property {function} ClientTransferContext - {@link bo.common.ClientTransferContext Client transfer context}
 *      constructor to create new context object for custom client transfer functions.
 * @property {function} DataTransferContext - {@link bo.common.DataTransferContext Data transfer context}
 *      constructor to create new context object for custom data transfer functions.
 */
const index = {
  ModelType: ModelType,
  ModelBase: ModelBase,
  CollectionBase: CollectionBase,

  ExtensionManager: ExtensionManager,
  DataStore: DataStore,
  ModelState: ModelState,
  ModelError: ModelError,

  PropertyInfo: PropertyInfo,
  PropertyFlag: PropertyFlag,
  PropertyManager: PropertyManager,
  PropertyContext: PropertyContext,
  ClientTransferContext: ClientTransferContext,
  DataTransferContext: DataTransferContext
};

// Immutable object.
Object.freeze( index );

export default index;
