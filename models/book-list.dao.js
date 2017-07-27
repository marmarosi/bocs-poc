'use strict';

const bo = require( 'business-objects' );
const DaoBase = bo.dataAccess.DaoBase;

class BookListDao extends DaoBase {

  constructor() {
    super( 'BookListDao' );
  }

  fetch( ctx, filter ) {
    const bookList = [];
    bookList.push( { bookKey: 1, author: 'Tom Wood', title: 'The enemy' } );
    bookList.push( { bookKey: 2, author: 'China Mieville', title: 'Kraken' } );
    bookList.push( { bookKey: 3, author: 'James Clavell', title: 'The shogun' } );
    bookList.push( { bookKey: 4, author: 'John Steinbeck', title: 'East of Eden' } );
    bookList.push( { bookKey: 5, author: 'Mario Vargas Llosa', title: 'El hablador' } );
    bookList.push( { bookKey: 6, author: 'Joseph Heller', title: 'Trap 22' } );
    bookList.totalItems = 6;
    ctx.fulfill( bookList );
  };
}

module.exports = BookListDao;
