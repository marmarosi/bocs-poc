'use strict';

const bo = require( 'business-objects' );
const bookTagCtor = require( './book-tag.js' );

const DaoBase = bo.dataAccess.DaoBase;
const daoBookTag = new bookTagCtor();

class BooksDao extends DaoBase {

  constructor() {
    super( 'BooksDao' );
  }

  fetch( ctx ) {
    const books = [];

    const book1 = {
      bookKey: 71,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false
    };
    books.push( book1 );

    const book2 = {
      bookKey: 77,
      author: 'Victor Hugo',
      title: 'The miserables',
      publishDate: 1,
      price: 34.5,
      used: false
    };
    books.push( book2 );

    return daoBookTag.$runMethod( 'fetchForBook', ctx.connection, book1.bookKey )
      .then( tags => {
        book1.tags = tags;
        daoBookTag.$runMethod( 'fetchForBook', ctx.connection, book2.bookKey )
          .then( tags => {
            book2.tags = tags;
            ctx.fulfill( books );
          } );
      } );
  }

  fetchFromTo( ctx, filter ) {
    const books = [];

    const book1 = {
      bookKey: key,
      author: 'James Clavell',
      title: 'The shogun',
      publishDate: 1,
      price: 34.5,
      used: false
    };
    books.push( book1 );

    const book2 = {
      bookKey: 77,
      author: 'Victor Hugo',
      title: filter,
      publishDate: 1,
      price: 34.5,
      used: false
    };
    books.push( book2 );

    return daoBookTag.$runMethod( 'fetchForBook', ctx.connection, book.bookKey )
      .then( tags => {
        book1.tags = tags;
        book2.tags = tags;
        ctx.fulfill( books );
      } );
  };
}

module.exports = BooksDao;
