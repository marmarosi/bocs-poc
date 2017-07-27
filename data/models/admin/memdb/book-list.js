'use strict';

const bo = require( 'business-objects' );
const DaoBase = bo.dataAccess.DaoBase;

class BookListDao extends DaoBase {

  constructor() {
    super( 'BookListDao' );
  }

  fetch( ctx, filter ) {
    const bookList = [];
    bookList.push( { bookKey: 7, author: 'Molnár Ferenc', title: 'A Pál utcai fiúk' } );
    bookList.push( { bookKey: 8, author: 'Gárdony Géza', title: 'Az egri csillagok' } );
    bookList.push( { bookKey: 9, author: 'Jókai Mór', title: 'Egy magyar nábo' } );
    bookList.totalItems = 3;
    ctx.fulfill( bookList );
  };
}

module.exports = BookListDao;
