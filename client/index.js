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
import dataTypes from './data-types/index.js';
import rules from './rules/index.js';
import common from './common/index.js';
import system from './system/index.js';
import apiAccess from './api-access/index.js';

//import configuration from './system/configuration.js';
import i18n from './i18n.js';

//endregion

function initialize( config, appLocales ) {
  system.Configuration.initialize( config );
  i18n.initialize( appLocales, this.system.Configuration.getLocale );
}

/**
 * List of models and helper namespaces.
 *
 * @namespace bo
 *
 * @property {namespace} commonRules - {@link bo.commonRules Common rules namespace}
 *      contains frequently used rules.
 * @property {namespace} dataTypes - {@link bo.dataTypes Data types namespace}
 *      contains data type components and definitions.
 * @property {namespace} rules - {@link bo.rules Rules namespace}
 *      contains components of validation and authorization rules.
 * @property {namespace} common - {@link bo.common Common namespace}
 *      contains components used by models, collections and other components.
 * @property {namespace} system - {@link bo.system System namespace}
 *      contains general components.
 * @property {namespace} apiAccess - {@link bo.apiAccess API access namespace}
 *      contains API portal access components.
 *
 * @property {object} configuration - Object containing
 *      {@link bo.common~configuration configuration} data of the business objects.
 * @property {function} i18n - {@link bo.i18n Internationalization}
 *      constructor to create new a message localizer object.
 */
export {
  ModelComposer,

  EditableRootObject,
  EditableChildObject,
  EditableRootCollection,
  EditableChildCollection,
  ReadOnlyRootObject,
  ReadOnlyChildObject,
  ReadOnlyRootCollection,
  ReadOnlyChildCollection,
  CommandObject,

  commonRules,
  dataTypes,
  rules,
  common,
  system,
  apiAccess,

  i18n,
  initialize
};
