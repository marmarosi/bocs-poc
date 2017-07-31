'use strict';

import i18n from './i18n.js';

/**
 * Get a message localizer function initialized for the messages of
 * the business objects package, i.e. the namespace is '$bo'.
 *
 * @function internal#i18nBO
 * @protected
 * @param {string} [keyRoot] - The key root of the messages.
 * @returns {bo.i18n#get} The message localizer function.
 */
const getLocalizer = function ( keyRoot ) {
  const boLocales = new i18n( '$bo', keyRoot );

  return function () {
    return boLocales.get.apply( boLocales, arguments.length ? arguments : [ 'default' ] );
  }
};

export default getLocalizer;
