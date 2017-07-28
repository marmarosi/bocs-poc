'use strict';

import Argument from './argument-check.js';
import NotImplementedError from './not-implemented-error.js';

const _userCode = new WeakMap();

/**
 * Serves as the base class for user information object.
 *
 * @memberof bo.system
 */
class UserInfo {

  /**
   * Creates a new user information objects.
   * @param {string} [userCode] - The identifier of the user.
   *
   * @throws {@link bo.system.ArgumentError Argument error}: The userCode must be a string or null.
   */
  constructor( userCode ) {
    this.userCode = Argument.inConstructor( this.constructor.name )
      .check( userCode ).forOptional( 'userCode' ).asString();
  }

  /**
   * The identifier of the user.
   * @member {string}
   */
  get userCode() {
    return _userCode.get( this );
  }
  set userCode( value ) {
    let userCode = _userCode.get( this );
    userCode = Argument.inProperty( this.constructor.name, 'userCode' )
      .check( value ).forOptional().asString();
    _userCode.set( this, userCode );
  }

  /**
   * Abstract method to determine if the user is member of the given role.
   *
   * @abstract
   * @param {string} role - The name of the role.
   * @returns {boolean} True if the user is a member of the role, otherwise false.
   *
   * @throws {@link bo.system.NotImplementedError Not implemented error}:
   *    The UserInfo.isInRole method is not implemented.
   */
  isInRole( role ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'isInRole' );
  }
}

Object.seal( UserInfo.prototype );

export default UserInfo;
