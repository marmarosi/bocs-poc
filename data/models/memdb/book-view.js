'use strict';

const bo = require( 'business-objects' );

const DaoBase = bo.dataAccess.DaoBase;

class BookViewDao extends DaoBase {

  constructor() {
    super( 'BookViewDao' );
  }

  fetch( ctx, filter ) {
    const key = filter;
    const book = {
      bookKey: key,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false,
      tags: [
        { bookTagKey: 31, bookKey: key, tag: 'adventure' },
        { bookTagKey: 32, bookKey: key, tag: 'history' }
      ]
    };
    ctx.fulfill( book );
  }

  fetchByTitle( ctx, filter ) {
    const title = filter;
    const book = {
      bookKey: 7,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false,
      tags: [
        { bookTagKey: 31, bookKey: key, tag: 'adventure' },
        { bookTagKey: 32, bookKey: key, tag: 'history' }
      ]
    };
    ctx.fulfill( book );
  }
}

module.exports = BookViewDao;
