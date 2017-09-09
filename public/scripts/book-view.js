'use strict';

bo.initialize( lib.config, lib.locales );

const BookView = lib.data.models.BookView;

BookView.get( 123 )
  .then( book => {
    document.getElementById("author").innerText = book.author;
    document.getElementById("title").innerHTML =
      '<a href="/book-edit/' + book.bookKey + '">' + book.title + '</a>';
    document.getElementById("publishDate").innerText = book.publishDate.toString();
    document.getElementById("price").innerText = book.price.toString();
    document.getElementById("used").innerText = book.used.toString();

    let tags = '';
    book.tags.forEach( tag => {
      if (tags)
        tags += ', ';
      tags += tag.tag;
    } );
    document.getElementById("tags").innerText = tags;
  } );
