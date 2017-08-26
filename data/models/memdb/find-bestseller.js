'use strict';

const bo = require( 'business-objects' );

const DaoBase = bo.dataAccess.DaoBase;

class FindBestsellerDao extends DaoBase {

  constructor() {
    super( 'FindBestsellerDao' );
  }

  execute( ctx, data ) {

    data.result = true;
    ctx.fulfill( data );
  }

  inYearByTags( ctx, data ) {

    const book = {
      bookKey: 55,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false,
      tags: [
        { bookTagKey: 31, bookKey: 55, tag: 'adventure' },
        { bookTagKey: 32, bookKey: 55, tag: 'history' }
      ]
    };
    data.result = book;
    ctx.fulfill( data );
  }
}

module.exports = FindBestsellerDao;
