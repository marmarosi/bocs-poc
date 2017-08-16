'use strict';

const bo = require( 'business-objects' );
const bookTagCtor = require( './book-tag.js' );

const DaoBase = bo.dataAccess.DaoBase;
const daoBookTag = new bookTagCtor();

class BookDao extends DaoBase {

  constructor() {
    super( 'BookDao' );
  }

  create( ctx ) {
    const data = {
      publishDate: new Date()
    };
    ctx.fulfill( data );
  }

  fetch( ctx, filter ) {
    const key = filter;

    const book = {
      bookKey: key,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false
    };

    return daoBookTag.$runMethod( 'fetchForBook', ctx.connection, book.bookKey )
      .then( tags => {
        book.tags = tags;
        ctx.fulfill( order );
      } );
  }

  fetchByTitle( ctx, filter ) {

    const book = {
      bookKey: 77,
      author: 'Victor Hugo',
      title: filter,
      publishDate: 1,
      price: 34.5,
      used: false
    };

    return daoBookTag.$runMethod( 'fetchForBook', ctx.connection, book.bookKey )
      .then( tags => {
        book.tags = tags;
        ctx.fulfill( book );
      } );
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

    ctx.fulfill( data );
  }

  remove( ctx, filter ) {

    ctx.fulfill( null );
  }
}
module.exports = BookDao;
