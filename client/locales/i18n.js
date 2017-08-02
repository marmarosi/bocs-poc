'use strict';

// const fs = require( 'fs' );
// const path = require( 'path' );
// const util = require( 'util' );
// const Utility = require( '../system/utility.js' );

const NEUTRAL = 'default';
const NS_ROOT = '$default';
const NS_BO = '$bo';

//const locales = {};
let locales = {};
let getCurrentLocale = function () { return NEUTRAL; };
let isInitialized = false;

//region Read locales

// function readProjectLocales( pathOfLocales ) {
//   // Read default namespace.
//   readLocales( NS_ROOT, pathOfLocales );
//
//   // Read other namespaces.
//   fs.readdirSync( pathOfLocales ).filter( function ( directoryName ) {
//     return fs.statSync( path.join( pathOfLocales, directoryName ) ).isDirectory() &&
//       path.extname( directoryName ) !== NS_ROOT &&
//       path.extname( directoryName ) !== NS_BO;
//   } ).forEach( function ( directoryName ) {
//     readLocales( directoryName, path.join( pathOfLocales, directoryName ) );
//   } );
// }
//
// function readLocales( namespace, localePath ) {
//   locales[ namespace ] = {};
//   fs.readdirSync( localePath ).filter( function ( fileName ) {
//     return fs.statSync( path.join( localePath, fileName ) ).isFile() && path.extname( fileName ) === '.json';
//   } ).forEach( function ( fileName ) {
//     const filePath = path.join( localePath, fileName );
//     locales[ namespace ][ path.basename( fileName, '.json' ) ] = require( filePath );
//   } );
//   mergeLocales( namespace );
// }
//
// function mergeLocales( namespace ) {
//   for (const langExt in locales[ namespace ]) {
//     if (locales[ namespace ].hasOwnProperty( langExt )) {
//       const ix = langExt.indexOf( '.' );
//       if (ix > 0) {
//         // It is an extension.
//         const langBase = langExt.substr( 0, ix );
//         const objExt = locales[ namespace ][ langExt ];
//         let objBase = locales[ namespace ][ langBase ];
//         if (!objBase)
//           objBase = {};
//         // Copy items to base language.
//         for (const key in objExt) {
//           if (objExt.hasOwnProperty( key )) {
//             if (objBase[ key ])
//               console.log( 'Duplicated locale: ' + namespace + '["' + langExt + '"].' + key +
//                 ' => ' + namespace + '.' + langBase + '.' + key );
//             else
//               objBase[ key ] = objExt[ key ];
//           }
//         }
//         // Remove extension.
//         delete locales[ namespace ][ langExt ];
//       }
//     }
//   }
// }
//
// // Read business-objects locales.
// const bolDirectories = [ 'node_modules/business-objects/locales', 'source/locales', 'locales' ];
// for (let i = 0; i < bolDirectories.length; i++) {
//   const bolDirectory = bolDirectories[ i ];
//   if (fs.existsSync( path.join( process.cwd(), bolDirectory ) )) {
//     readLocales( NS_BO, path.join( process.cwd(), bolDirectory ) );
//     break;
//   }
// }

//endregion

//region Custom error

/**
 * Represents an internationalization error.
 *
 * @memberof bo
 * @extends {Error}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error Error} for further information.
 */
class I18nError extends Error {

  /**
   * Creates an internationalization error object.
   *
   * @param {string} [message] - Human-readable description of the error.
   * @param {...*} [params] - Optional interpolation parameters of the message.
   */
  constructor( message, ...params ) {
    super();

    const i18nLocales = new i18n( '$bo', 'I18nError' );

    /**
     * The name of the error type.
     * @member {string} bo.I18nError#name
     * @default I18nError
     */
    this.name = I18nError.name;

    /**
     * Human-readable description of the error.
     * @member {string} bo.I18nError#message
     */
    this.message = i18nLocales.get.apply( i18nLocales, arguments.length ? arguments : [ 'default' ] );
  }
}

//endregion

//region Define message handler

/**
 * Provide methods to get localized messages.
 *
 * @memberof bo
 */
class i18n {

  /**
   * Creates a new message localizer object.
   *
   * @param {string} [namespace=$default] - The namespace of the messages.
   * @param {string} [keyRoot] - The key root of the messages.
   *
   * @throws {@link bo.I18nError i18n error}: The namespace must be a string value or null.
   * @throws {@link bo.I18nError i18n error}: The key root must be a string value or null.
   */
  constructor( namespace, keyRoot ) {

    this.namespace = Utility.isOptionalString( namespace, 'namespace', I18nError ) || NS_ROOT;
    this.keyRoot = Utility.isOptionalString( keyRoot, 'keyRoot', I18nError ) || '';

    if (this.keyRoot && this.keyRoot.substr( -1 ) !== '.')
      this.keyRoot += '.';

    // Immutable object.
    Object.freeze( this );
  }

  /**
   * Reads the localized messages of the project.
   *
   * @function bo.i18n.initialize
   * @param {string} pathOfLocales - The relative path of the directory that contains the project messages.
   * @param {external.getLocale} [getLocale] - A function that returns the current locale.
   *
   * @throws {@link bo.I18nError i18n error}: The path of locales must be a non-empty string.
   * @throws {@link bo.I18nError i18n error}: The path of locales is not a valid directory path.
   * @throws {@link bo.I18nError i18n error}: The locale getter must be a function.
   */
  static initialize( pathOfLocales, getLocale ) {

    if (isInitialized)
      throw new I18nError( 'ready' );

    // readProjectLocales(
    //   Utility.getDirectory( pathOfLocales, 'pathOfLocales', I18nError )
    // );
    try {
      import appLocales from '/scripts/app.locales.json';
      locales = appLocales;
      delete appLocales;
    }
    catch( err ) {
      locales = { };
    }
    import boLocales from '../resources/bo.locales.json';
    locales[ NS_BO ] = boLocales;
    delete boLocales;

    if (getLocale) {
      if (typeof getLocale === 'function')
        getCurrentLocale = getLocale;
      else
        throw new I18nError( 'function', 'getLocale' );
    }

    isInitialized = true;
  }

  /* locale*namespace:key1.key2.key3 */
  /**
   * Gets a localized message of a given identifier.
   * The message identifier has the pattern: [locale*][namespace:]key1[[.key2]...]
   * Examples:
   * <dl>
   *   <dt>australia</dt>
   *   <dd>Simple key with default namespace and current locale.</dd>
   *   <dt>europe.spain.andalusia</dt>
   *   <dd>Extended key with default namespace and current locale.</dd>
   *   <dt>geography:australia</dt>
   *   <dd>Simple key with specified namespace and current locale.</dd>
   *   <dt>geography:europe.spain.andalusia</dt>
   *   <dd>Extended key with specified namespace and current locale.</dd>
   *   <dt>hu\*australia</dt>
   *   <dd>Simple key with default namespace and specified language.</dd>
   *   <dt>hu-HU\*europe.spain.andalusia</dt>
   *   <dd>Extended key with default namespace and specified language with region.</dd>
   *   <dt>hu\*geography:australia</dt>
   *   <dd>Simple key with specified namespace and specified language.</dd>
   *   <dt>hu-HU\*geography:europe.spain.andalusia</dt>
   *   <dd>Extended key with specified namespace and specified language with region.</dd>
   * </dl>
   * If localizer is created with a namespace and the message identifier omits the namespace,
   * then the localizer namespace will applied. Examples for initial namespace <i>economy</i>:
   * <dl>
   *   <dt>australia</dt>
   *   <dd>It is interpreted as <i>economy:australia</i></dd>
   *   <dt>hu-HU\*europe.spain.andalusia</dt>
   *   <dd>It is interpreted as <i>hu-HU\*economy:europe.spain.andalusia</i></dd>
   *   <dt>geography:australia</dt>
   *   <dd>It remains <i>geography:australia</i></dd>
   *   <dt>hu-HU\*geography:europe.spain.andalusia</dt>
   *   <dd>It remains <i>hu-HU\*geography:europe.spain.andalusia</i></dd>
   * </dl>
   * If localizer is created with a key root and the message identifier omits the namespace,
   * then the key root is inserted before the key part of the specified identifier.
   * Examples for initial key root <i>earth</i>:
   * <dl>
   *   <dt>australia</dt>
   *   <dd>It is interpreted as <i>earth.australia</i></dd>
   *   <dt>hu-HU\*europe.spain.andalusia</dt>
   *   <dd>It is interpreted as <i>hu-HU\*earth.europe.spain.andalusia</i></dd>
   *   <dt>geography:australia</dt>
   *   <dd>It remains <i>geography:australia</i></dd>
   *   <dt>hu-HU\*geography:europe.spain.andalusia</dt>
   *   <dd>It remains <i>hu-HU\*geography:europe.spain.andalusia</i></dd>
   * </dl>
   *
   * @function bo.i18n#get
   * @param {string} messageId - The identifier of the required message.
   * @param {...*} [messageParams] - Optional interpolation parameters of the message.
   * @returns {string} The localized message for the current locale, if not found
   *      then the message for the default locale, otherwise the message key.
   *
   * @throws {@link bo.I18nError i18n error}: The message key must be a non-empty string.
   */
  get( messageId, messageParams ) {
    let locale, namespace, messageKey;
    let asterisk = messageId.indexOf( '*' );
    let colon = messageId.indexOf( ':' );

    // Determine locale.
    if (asterisk > -1)
      locale = messageId.substr( 0, asterisk );
    asterisk++;
    locale = locale || getCurrentLocale() || NEUTRAL;

    // Determine namespace.
    if (colon > -1)
      namespace = messageId.substring( asterisk, colon );
    colon++;
    namespace = namespace || this.namespace;

    // Determine message key.
    messageKey = messageId.substr( Math.max( asterisk, colon ) );
    if (!colon)
      messageKey = this.keyRoot + messageKey;

    const keys = messageKey.split( '.' ).filter( function ( key ) {
      return key.trim().length > 0;
    } );
    if (!keys.length)
      throw new I18nError( 'messageId' );

    // If message is not found then the identifier is returned.
    let message = messageId;
    let found = false;
    const messageArgs = arguments;

    // Replace message parameters with passed arguments.
    function replacer( match ) {
      const index = new Number( match.substr( 1, match.length - 2 ) ) + 1;
      let replacement = '';
      if (index < messageArgs.length) {
        const arg = messageArgs[ index ];
        if (arg !== undefined && arg !== null)
          replacement = typeof arg === 'function' ?
            (arg.name ? arg.name : '<< unknown >>') :
            arg.toString();
      }
      return replacement;
    }

    // Find the message in the tree.
    function readMessage( messages ) {
      let base = messages;
      for (let i = 0; i < keys.length; i++) {
        if (!base[ keys[ i ] ])
          return false;
        if (i + 1 === keys.length) {
          message = base[ keys[ i ] ];
          return true;
        } else
          base = base[ keys[ i ] ];
      }
    }

    // Use the required message set.
    const ns = locales[ namespace ];

    // When namespace is valid...
    if (ns) {
      // Get message of specific locale.
      if (ns[ locale ])
        found = readMessage( ns[ locale ] );
      // Get message of general locale.
      if (!found) {
        const general = locale.substr( 0, locale.lastIndexOf( '-' ) );
        if (general && ns[ general ])
          found = readMessage( ns[ general ] );
      }
      // Get message of default locale.
      if (!found && locale !== NEUTRAL && ns[ NEUTRAL ])
        found = readMessage( ns[ NEUTRAL ] );
    }

    // Format message with optional arguments.
    if (messageArgs.length > 1)
      message = message.replace( /{\d+}/g, replacer );

    return message;
  }
}

//endregion

export default i18n;
