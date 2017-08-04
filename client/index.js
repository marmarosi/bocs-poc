'use strict';

//region Imports

import ModelComposer from './model-composer.js';

import EditableRootObject from './editable-root-object.js';
import EditableChildObject from './editable-child-object.js';
import EditableRootCollection from './editable-root-collection.js';
import EditableChildCollection from './editable-child-collection.js';
import ReadOnlyRootObject from './read-only-root-object.js';
import ReadOnlyChildObject from './read-only-child-object.js';
import ReadOnlyRootCollection from './read-only-root-collection.js';
import ReadOnlyChildCollection from './read-only-child-collection.js';
import CommandObject from './command-object.js';

import commonRules from './common-rules/index.js';
import dataAccess from './data-access/index.js';
import dataTypes from './data-types/index.js';
import rules from './rules/index.js';
import common from './common/index.js';
import system from './system/index.js';

//import configuration from './system/configuration.js';
import i18n from './i18n.js';

//endregion

/**
 * List of models and helper namespaces.
 *
 * @namespace bo
 *
 * @property {namespace} commonRules - {@link bo.commonRules Common rules namespace}
 *      contains frequently used rules.
 * @property {namespace} dataAccess - {@link bo.dataAccess Data access namespace}
 *      contains data access components.
 * @property {namespace} dataTypes - {@link bo.dataTypes Data types namespace}
 *      contains data type components and definitions.
 * @property {namespace} rules - {@link bo.rules Rules namespace}
 *      contains components of validation and authorization rules.
 * @property {namespace} common - {@link bo.common Common namespace}
 *      contains components used by models, collections and other components.
 * @property {namespace} system - {@link bo.system System namespace}
 *      contains general components.
 *
 * @property {object} configuration - Object containing
 *      {@link bo.common~configuration configuration} data of the business objects.
 * @property {function} i18n - {@link bo.i18n Internationalization}
 *      constructor to create new a message localizer object.
 */
const index = {
  ModelComposer: ModelComposer,

  // ModelBase: ModelBase,
  // CollectionBase: CollectionBase,

  EditableRootObject: EditableRootObject,
  EditableChildObject: EditableChildObject,
  EditableRootCollection: EditableRootCollection,
  EditableChildCollection: EditableChildCollection,
  ReadOnlyRootObject: ReadOnlyRootObject,
  ReadOnlyChildObject: ReadOnlyChildObject,
  ReadOnlyRootCollection: ReadOnlyRootCollection,
  ReadOnlyChildCollection: ReadOnlyChildCollection,
  CommandObject: CommandObject,

  commonRules: commonRules,
  dataAccess: dataAccess,
  dataTypes: dataTypes,
  rules: rules,
  common: common,
  system: system,

  // configuration: configuration,
  i18n: i18n,

  /**
   * Initializes the business objects.
   *
   * @function bo.initialize
   * @param {object} config - The initializer object of the configuration.
   * @param {object} appLocales - The combined object of the application locales.
   */
  initialize: function ( config, appLocales ) {
    this.system.Configuration.initialize( config );
    this.i18n.initialize( appLocales, this.system.Configuration.getLocale );
  }
};

// Immutable object.
Object.freeze( index );

global.bo = index;
