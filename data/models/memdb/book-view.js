'use strict';

const bo = require( 'business-objects' );
const DaoBase = bo.dataAccess.DaoBase;

class BookViewDao extends DaoBase {

  constructor() {
    super( 'BookViewDao' );
  }

  fetch( ctx, filter ) {
    const key = filter;
    const order = {
      bookKey: key,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false
    };
    ctx.fulfill( order );
  }

  fetchByTitle( ctx, filter ) {
    const title = filter;
    const order = {
      bookKey: 7,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false
    };
    ctx.fulfill( order );
  }
}

module.exports = BookViewDao;