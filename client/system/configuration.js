'use strict';

//region Imports

import ConfigurationError from './configuration-error.js';
import ConnectionManagerBase from '../data-access/connection-manager-base.js';
import daoBuilder from '../data-access/dao-builder.js';
import NoAccessBehavior from '../rules/no-access-behavior.js';
import BrokenRulesResponse from '../rules/broken-rules-response.js';
import UserInfo from './user-info.js';

//endregion

//region Private variables

let _isInitialized = false;
let _connectionManager = null;
let _daoBuilder = daoBuilder;
let _userReader = null;
let _getLocale = null;
let _pathOfLocales = null;
let _noAccessBehavior = NoAccessBehavior.throwError;
let _brokenRulesResponse = null;

//endregion

/**
 * The configuration of business objects.
 *
 * @name bo.system.configuration
 */
class Configuration {

  //region Properties

  /**
   * The connection manager instance.
   * It must be set via {@link bo.initialize} or {@link bo.configuration.initialize}.
   * @member {bo.dataAccess.ConnectionManagerBase} bo.system.configuration.connectionManager
   * @readonly
   * @static
   */
  static get connectionManager() {
    return _connectionManager;
  }

  /**
   * Factory method to create data access objects.
   * The default method is {@link bo.dataAccess.daoBuilder}.
   * @member {external.daoBuilder} bo.system.configuration.daoBuilder
   * @readonly
   * @static
   * @default bo.dataAccess.daoBuilder
   */
  static get daoBuilder() {
    return _daoBuilder;
  }

  /**
   * Returns the current user. The default method returns null, i.e. anonymous user is assumed.
   *
   * @function bo.system.configuration.getUser
   * @returns {bo.system.UserInfo} The current user.
   *
   * @throws {@link bo.system.ConfigurationError Configuration error}:
   *      The function defined by the userReader property of business objects' configuration
   *      must return a UserInfo object.
   */
  static getUser() {

    let user = null;
    if (_userReader) {
      user = _userReader();
      if (user === undefined)
        user = null;
      else if (user !== null && !(user instanceof UserInfo) && user.super_ !== UserInfo)
        throw new ConfigurationError( 'userReader' );
    }
    return user;
  }

  /**
   * Returns the current locale. The default method returns an empty string,
   * i.e. the business objects will use the default messages.
   *
   * @function bo.system.configuration.getLocale
   * @returns {string} The current locale.
   *
   * @throws {@link bo.system.ConfigurationError Configuration error}:
   *      The function defined by the localeReader property of business objects' configuration
   *      must return a string value.
   */
  static getLocale() {

    let locale = '';
    if (_getLocale) {
      locale = _getLocale() || '';
      if (typeof locale !== 'string' && !(locale instanceof String))
        throw new ConfigurationError( 'localeReader' );
    }
    return locale;
  }

  /**
   * The relative path of the directory containing project locales. If not supplied,
   * the business objects cannot interpret the first message argument as the message key,
   * i.e. the first message argument must be the message text.
   * @member {string} bo.system.configuration.pathOfLocales
   * @readonly
   * @static
   */
  static get pathOfLocales() {
    return _pathOfLocales;
  }

  /**
   * The default behavior for unauthorized operations.
   * The default value is {@link bo.rules.NoAccessBehavior#throwError}.
   * @member {bo.rules.NoAccessBehavior} bo.system.configuration.noAccessBehavior
   * @readonly
   * @static
   * @default bo.rules.NoAccessBehavior#throwError
   */
  static get noAccessBehavior() {
    return _noAccessBehavior;
  }

  /**
   * The constructor of the response object for a broken rules request.
   * The default value is {@link bo.rules.BrokenRulesResponse}.
   * @member {bo.rules.BrokenRulesResponse} bo.system.configuration.brokenRulesResponse
   * @readonly
   * @static
   * @default bo.rules.BrokenRulesResponse
   */
  static get brokenRulesResponse() {
    return _brokenRulesResponse || BrokenRulesResponse;
  }

  //endregion

  /**
   * Reads the configuration of business objects.
   *
   * @function bo.system.configuration.initialize
   * @param {object} config - The initializer object of the configuration.
   *
   * @throws {@link bo.system.ConfigurationError Configuration error}:
   *      The configuration is already initialized.
   * @throws {@link bo.system.ConfigurationError Configuration error}:
   *      The connection manager is required.
   * @throws {@link bo.system.ConfigurationError Configuration error}:
   *      The connection manager must inherit ConnectionManagerBase type.
   */
  static initialize( config ) {

    if (_isInitialized)
      throw new ConfigurationError( 'ready' );

    // Test if configuration file was found.
    if (config) {

      // // Evaluate the connection manager.
      // if (config.connectionManager) {
      //   if (typeof config.connectionManager !== 'function')
      //     throw new ConfigurationError( 'function_2', 'connectionManager' );
      //   _connectionManager = new config.connectionManager();
      //   if (!(_connectionManager instanceof ConnectionManagerBase))
      //     throw new ConfigurationError( 'wrongConMan' );
      // } else
      //   throw new ConfigurationError( 'noConMan' );

      // // Evaluate the data access object builder.
      // if (config.daoBuilder) {
      //   if (typeof config.daoBuilder !== 'function')
      //     throw new ConfigurationError( 'function_2', 'daoBuilder' );
      //   _daoBuilder = config.daoBuilder;
      // }

      // Evaluate the user information reader.
      if (config.userReader) {
        if (typeof config.userReader !== 'function')
          throw new ConfigurationError( 'function_2', 'userReader' );
        _userReader = config.userReader;
      }

      // Evaluate the locale reader.
      if (config.localeReader) {
        if (typeof config.localeReader !== 'function')
          throw new ConfigurationError( 'function_2', 'localeReader' );
        _getLocale = config.localeReader;
      }

      // // Evaluate the path of locale.
      // if (config.pathOfLocales) {
      //   if ((typeof pathOfLocales !== 'string' && !(pathOfLocales instanceof String)) ||
      //     pathOfLocales.trim().length === 0)
      //     throw new ConfigurationError( 'string', 'pathOfLocales' );
      //   // TODO
      //   //if (cfg.pathOfLocales not exists...)
      //   _pathOfLocales = config.pathOfLocales;
      // }

      // Evaluate the unauthorized behavior.
      if (config.noAccessBehavior !== undefined && config.noAccessBehavior !== null) {
        _noAccessBehavior = isEnumMember(
          config.noAccessBehavior, NoAccessBehavior, 'noAccessBehavior', ConfigurationError
        );
      }

      // Evaluate the broken rules response.
      if (config.brokenRulesResponse) {
        if (typeof config.brokenRulesResponse !== 'function')
          throw new ConfigurationError( 'function_2', 'brokenRulesResponse' );
        _brokenRulesResponse = config.brokenRulesResponse;
      }
    }
    _isInitialized = true;
  }
}

function isEnumMember( value, enumType, name, errorType ) {

  if (!(enumType && enumType.hasMember && enumType.constructor &&
      Object.getPrototypeOf( enumType.constructor ) &&
      Object.getPrototypeOf( enumType.constructor ).name === 'Enumeration'))
    throw new errorType( 'enumType', enumType );

  if (typeof value === 'string' && enumType.isMemberName( value ))
    value = enumType.getValue( value );
  else if (!enumType.hasMember( value ))
    throw new errorType( 'enumMember', name, enumType.$name );

  return value;
}

Object.freeze( Configuration );

export default Configuration;
