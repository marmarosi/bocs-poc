'use strict';

import Argument from '../system/argument-check.js';

/**
 * Represents the context for the methods of data access objects.
 *
 * @memberof bo.dataAccess
 */
class DaoContext {

  /**
   *  Creates a new context object for a data access object.
   *
   *  <i><b>Warning:</b> Data access context objects are created in models internally.
   *  They are intended only to make publicly available the context
   *  for data access actions.</i>
   *
   * @param {function} fulfill - The success handler of the promise executor.
   * @param {function} reject - The failure handler of the promise executor.
   * @param {object} connection - The connection to the data source.
   */
  constructor( fulfill, reject, connection ) {
    const check = Argument.inConstructor( DaoContext.name );

    /**
     * The success handler of the promise executor.
     * @member {function} bo.dataAccess.DaoContext#fulfill
     * @readonly
     */
    this.fulfill = check( fulfill ).forMandatory( 'fulfill' ).asFunction();

    /**
     * The failure handler of the promise executor.
     * @member {function} bo.dataAccess.DaoContext#reject
     * @readonly
     */
    this.reject = check( reject ).forMandatory( 'reject' ).asFunction();

    /**
     * The connection to the data source.
     * @member {object} bo.dataAccess.DaoContext#connection
     * @readonly
     */
    this.connection = check( connection ).forOptional( 'connection' ).asObject();

    // Immutable object.
    Object.freeze( this );
  }
}

export default DaoContext;
