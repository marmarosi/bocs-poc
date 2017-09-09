'use strict';

bo.initialize( lib.config, lib.locales );

const BookTest = lib.data.models.BookTest;

BookTest.get( 101 )
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
  } )
  .catch( e => {
    document.getElementById("author").innerText =
      'HIBA: ' + e.message + ' (' + e.innerError.message + ')';
  } );

function simulateError() {

  BookTest.getByTitle( 'Júlia néni és a tollnok' )
    .then( book => {
      document.getElementById("author").innerText = 'Nincs hiba?';
    } )
    .catch( e => {
      document.getElementById("author").innerText =
        'HIBA: ' + e.message + ' (' + e.innerError.message + ')';
      document.getElementById("title").innerHTML = '';
      document.getElementById("publishDate").innerText = '';
      document.getElementById("price").innerText = '';
      document.getElementById("used").innerText = '';
      document.getElementById("tags").innerText = '';
    } );
}