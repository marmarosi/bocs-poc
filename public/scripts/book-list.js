'use strict';

bo.initialize( lib.config, lib.locales );

lib.data.models.BookList.getAll()
  .then( books => {
    let out = "";
    books.forEach( book => {
      out += '<a href="/book-view/' + book.bookKey + '">' +
        book.author + ': ' + book.title + '</a><br />';
    } );
    if (books.totalItems !== null)
      out += '<br />Total count: ' + books.totalItems.toString() + '<br />';
    document.getElementById("books").innerHTML = out;
  } );
