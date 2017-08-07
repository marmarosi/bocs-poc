'use strict';

import data from './data/index.js';
import locales from './app.locales.json';

const index = {
  data: data,
  locales: locales
};

//export default index;
global.clt = index;