'use strict';

const bo = require( 'business-objects' );

const DaoBase = bo.dataAccess.DaoBase;

class BookItemDao extends DaoBase {

  constructor() {
    super( 'BookItemDao' );
  }

  create( ctx ) {

    ctx.fulfill( {} );
  }

  insert( ctx, data ) {

    data.bookKey = 33;
    data.author += '!';
    data.title += '!';
    data.publishDate = new Date( data.publishDate ).setYear( 2033 );
    data.price += 100;
    data.used = !data.used;

    ctx.fulfill( data );
  }

  update( ctx, data ) {

    data.author += '?';
    data.title += '?';
    data.publishDate = new Date( data.publishDate ).setYear( 2022 );
    data.price += 50;
    data.used = !data.used;

    ctx.fulfill( data );
  }

  remove( ctx, filter ) {

    ctx.fulfill( null );
  }
}

module.exports = BookItemDao;
