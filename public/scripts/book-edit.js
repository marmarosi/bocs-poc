'use strict';

bo.initialize( lib.config, lib.locales );

let book;

lib.data.models.Book.get( 22 )
  .then( fetched => {
    book = fetched;
    show( '?' );
  } );

function show( mod ) {

  document.getElementById("key").innerText = book.bookKey;
  document.getElementById("author").value = book.author;
  document.getElementById("title").value = book.title;
  document.getElementById("publishDate").value = book.publishDate.toLocaleDateString();
  document.getElementById("price").value = book.price.toString();
  document.getElementById("used").checked = book.used;

  document.getElementById("tag1").value = book.tags.at( 0 ).tag + mod;
  document.getElementById("tag2").value = book.tags.at( 1 ).tag + mod;
}

function save() {
  book.author = document.getElementById("author").value;
  book.title = document.getElementById("title").value;
  book.publishDate = document.getElementById("publishDate").value;
  book.price = document.getElementById("price").value;
  book.used = document.getElementById("used").checked;

  const tag1 = book.tags.at( 0 );
  tag1.tag = document.getElementById("tag1").value;
  const tag2 = book.tags.at( 1 );
  tag2.tag = document.getElementById("tag2").value;

  if (book.isValid())
    book.save()
      .then( saved => {
        book = saved;
        show( '' );
      } );
  else {
    const brs = book.getBrokenRules();
  }
}

function remove() {
  book.remove();
  book.save()
    .then( () => {
      window.location = '/book-list';
    } );
}