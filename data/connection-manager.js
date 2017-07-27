'use strict';

const bo = require( 'business-objects' );
const ConnectionManagerBase = bo.dataAccess.ConnectionManagerBase;

let connectionId = 0;
let transactionId = 0;

// Connection class.
class Connection {

  constructor( dataSource ) {
    this.dataSource = dataSource;
    this.connectionId = ++connectionId;
    this.transactionId = null;
  }

  close() {
    this.connectionId = null;
  }

  begin() {
    this.transactionId = ++transactionId;
  }

  commit() {
    this.transactionId = null;
  }

  rollback() {
    this.transactionId = null;
  }
}

// Connection manager class.
class ConnectionManager extends ConnectionManagerBase {

  constructor() {
    super();
  }

  openConnection( dataSource ) {
    const connection = new Connection( dataSource );
    return Promise.resolve( connection );
  }

  closeConnection( dataSource, connection ) {
    connection.close();
    return Promise.resolve( null );
  }

  beginTransaction( dataSource ) {
    const connection = new Connection( dataSource );
    connection.begin();
    return Promise.resolve( connection );
  }

  commitTransaction( dataSource, connection ) {
    connection.commit();
    connection.close();
    return Promise.resolve( null );
  }

  rollbackTransaction( dataSource, connection ) {
    connection.rollback();
    connection.close();
    return Promise.resolve( null );
  }
}

module.exports = ConnectionManager;
