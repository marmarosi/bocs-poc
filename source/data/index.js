'use strict';

import models from './models/index.js';
import getLocale from './get-locale.js';
import getUser from './get-user.js';

const index = {
  models: models,
  getLocale: getLocale,
  getUser: getUser
};

export default index;
