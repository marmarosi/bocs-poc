'use strict';

import User from './user.js';

const userReader = function () {
  return new User(
    'jimmy-jump',
    'Jimmy Jump',
    'jimmy.jump@mail.net',
    [ 'administrators', 'developers', 'designers' ]
  );
};

export default userReader;
