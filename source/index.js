'use strict';

import data from './data/index.js';
import locales from './app.locales.json';

const config = {
    userReader: data.getUser,
    localeReader: data.getLocale
  };

export {
  data,
  locales,
  config
};
