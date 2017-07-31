'use strict';

import DaoContext from './dao-context.js';
import DaoError from './dao-error.js';

/**
 * Serves as the base class for data access objects.
 *
 * @memberof bo.dataAccess
 */
class DaoBase {

  /**
   * Creates a new data access object.
   *
   * @param {string} name - The name of the data access object.
   *
   * @throws {@link bo.dataAccess.DaoError Dao error}:
   *      The data access object name must be a non-empty string.
   */
  constructor( name ) {

    if (typeof name !== 'string' && !(name instanceof String) || name.trim().length === 0)
      throw new DaoError( 'c_manString', this.constructor.name, 'name' );

    /**
     * The name of the data access object.
     * @member {string} bo.dataAccess.DaoBase#name
     * @readonly
     */
    Object.defineProperty(this, 'name', {
      get: function() {
        return name;
      },
      enumeration: true
    });
  }

  /**
   * Executes the named method on the data access object.
   *
   * @function bo.dataAccess.DaoBase#$runMethod
   * @param {string} methodName - The name of the method to call.
   * @param {object} [connection] - The connection of the data source.
   * @param {object} [methodArg] - Additional argument of the method to execute.
   * @returns {Promise.<*>} Returns a promise to the result of the method.
   *
   * @throws {@link bo.dataAccess.DaoError Dao error}:
   *      The method name must be a non-empty string.
   * @throws {@link bo.dataAccess.DaoError Dao error}:
   *      Data access object has no method with the requested name.
   */
  $runMethod( methodName, connection, methodArg ) {

    if (typeof methodName !== 'string' || methodName.trim().length === 0)
      throw new DaoError( 'm_manString', this.name, '$runMethod', 'methodName' );
    if (!this[ methodName ] || typeof this[ methodName ] !== 'function')
      throw new DaoError( 'noMethod', this.name, methodName );

    return new Promise( (fulfill, reject) => {
      const ctx = new DaoContext( fulfill, reject, connection );
      this[ methodName ]( ctx, methodArg );
    });
  }

  /**
   * Determines if create method exists.
   *
   * @function bo.dataAccess.DaoBase#$hasCreate
   * @returns {boolean} True when create method exists, otherwise false.
   */
  $hasCreate() {
    return this['create'] !== undefined && typeof this['create'] === 'function';
  }
}

Object.seal( DaoBase.prototype );

export default DaoBase;
