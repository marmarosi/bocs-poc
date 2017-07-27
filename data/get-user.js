'use strict';

const User = require( './user.js' );

const userReader = function () {
  return new User(
    'jimmy-jump',
    'Jimmy Jump',
    'jimmy.jump@mail.net',
    [ 'administrators', 'developers', 'designers' ]
  );
};

module.exports = userReader;
