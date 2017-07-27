'use strict';

const bo = require( 'business-objects' );
const UserInfo = bo.system.UserInfo;

class User extends UserInfo {

  constructor( userCode, userName, email, roles ) {
    super( userCode );

    this.userName = userName;
    this.email = email;
    this.roles = roles;

    Object.freeze( this );
  }

  isInRole( role ) {
    return this.roles.some( function ( userRole ) {
      return userRole === role;
    } );
  }

  isInSomeRole( roles ) {
    return this.roles.some( function ( userRole ) {
      return roles.some( function ( role ) {
        return userRole === role;
      } );
    } );
  }

  isInEveryRole( roles ) {
    return roles.every( function ( role ) {
      return User.roles.some( function ( userRole ) {
        return userRole === role;
      } );
    } );
  }
}

module.exports = User;
