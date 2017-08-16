'use strict';

const bo = require( 'business-objects' );

const DaoBase = bo.dataAccess.DaoBase;

class BookTagDao extends DaoBase {

  constructor() {
    super( 'BookTagDao' );
  }

  create( ctx ) {

    ctx.fulfill( {} );
  }

  /* Special fetch method for test circumstances. */
  fetchForBook( ctx, filter ) {

    const tags = [];
    tags.push( { bookTagKey: 31, bookKey: filter, tag: 'adventure' } );
    tags.push( { bookTagKey: 32, bookKey: filter, tag: 'history' } );
    ctx.fulfill( tags );
  }

  insert( ctx, data ) {

    data.bookTagKey = 30;
    data.tag += '!';
    ctx.fulfill( data );
  }

  update( ctx, data ) {

    ctx.fulfill( data );
  }

  remove( ctx, filter ) {

    ctx.fulfill( null );
  }
}

module.exports = BookTagDao;
