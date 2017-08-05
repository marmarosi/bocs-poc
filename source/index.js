'use strict';

import data from './data/index.js';
import locales from './app.locales.json';

const index = {
  data: data,
  locales: locales
};

//module.exports = index;
global.clt = index;