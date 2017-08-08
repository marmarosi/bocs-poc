'use strict';

//region Imports

import ConfigurationError from './configuration-error.js';
import NoAccessBehavior from '../rules/no-access-behavior.js';
import UserInfo from './user-info.js';

//endregion

//region Private variables

let _isInitialized = false;
let _userReader = null;
let _getLocale = null;
let _noAccessBehavior = NoAccessBehavior.throwError;

//endregion

//region Helper methods

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

//endregion

/**
 * The configuration of business objects.
 *
 * @name bo.system.configuration
 */
class Configuration {

  //region Properties

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

  //endregion

  //region Initialize

  /**
   * Reads the configuration of business objects.
   *
   * @function bo.system.configuration.initialize
   * @param {object} config - The initializer object of the configuration.
   *
   * @throws {@link bo.system.ConfigurationError Configuration error}:
   *      The configuration is already initialized.
   */
  static initialize( config ) {

    if (_isInitialized)
      throw new ConfigurationError( 'ready' );

    // Test if configuration file was found.
    if (config) {

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

      // Evaluate the unauthorized behavior.
      if (config.noAccessBehavior !== undefined && config.noAccessBehavior !== null) {
        _noAccessBehavior = isEnumMember(
          config.noAccessBehavior, NoAccessBehavior, 'noAccessBehavior', ConfigurationError
        );
      }
    }
    _isInitialized = true;
  }

  //endregion
}

Object.freeze( Configuration );

export default Configuration;
