'use strict';

import NotImplementedError from '../system/not-implemented-error.js';

/**
 * @classdesc Serves as the base class to manage connections of several data sources.
 * @description Creates a new connection manager object.
 *
 * @memberof bo.dataAccess
 * @constructor
 */
class ConnectionManagerBase {

  /**
   * Returns a new connection of the named data source.
   *
   * @abstract
   * @function bo.dataAccess.ConnectionManagerBase#openConnection
   * @param {string} dataSource - The name of the data source.
   * @returns {Promise.<object>} Returns a promise to the new connection.
   */
  openConnection( dataSource ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'openConnection' );
  }

  /**
   * Closes the given connection of the data source.
   *
   * @abstract
   * @function bo.dataAccess.ConnectionManagerBase#openConnection
   * @param {string} dataSource - The name of the data source.
   * @param {object} connection - The connection to be closed.
   * @returns {Promise.<object>} Returns a promise to the closed connection.
   */
  closeConnection( dataSource, connection ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'closeConnection' );
  }

  /**
   * Returns a new connection of the named data source after having started a new transaction.
   * If the data source does not support transactions, returns a new connection only.
   *
   * @abstract
   * @function bo.dataAccess.ConnectionManagerBase#beginTransaction
   * @param {string} dataSource - The name of the data source.
   * @returns {Promise.<object>} Returns a promise to the new connection with initiated transaction.
   */
  beginTransaction( dataSource ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'beginTransaction' );
  }

  /**
   * Finalizes the current transaction and closes the connection of the data source.
   * If the data source does not support transactions, closes the given connection only.
   *
   * @abstract
   * @function bo.dataAccess.ConnectionManagerBase#commitTransaction
   * @param {string} dataSource - The name of the data source.
   * @param {object} connection - The connection to be closed.
   * @returns {Promise.<object>} Returns a promise to the closed connection.
   */
  commitTransaction( dataSource, connection ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'commitTransaction' );
  }

  /**
   * Cancels the current transaction and closes the connection of the data source.
   * If the data source does not support transactions, closes the given connection only.
   *
   * @abstract
   * @function bo.dataAccess.ConnectionManagerBase#rollbackTransaction
   * @param {string} dataSource - The name of the data source.
   * @param {object} connection - The connection to be closed.
   * @returns {Promise.<object>} Returns a promise to the closed connection.
   */
  rollbackTransaction( dataSource, connection ) {
    throw new NotImplementedError( 'method', this.constructor.name, 'rollbackTransaction' );
  }
}

export default ConnectionManagerBase;
