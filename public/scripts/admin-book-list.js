'use strict';

bo.initialize( lib.config, lib.locales );

lib.data.models.admin.BookList.getAll()
  .then( books => {
    let out = "";
    books.forEach( book => {
      out += '<a href="/book-view/' + book.bookKey + '">' +
        book.author + ': ' + book.title + '</a><br>';
    } );
    document.getElementById("books").innerHTML = out;
  } );