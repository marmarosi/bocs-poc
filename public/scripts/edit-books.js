'use strict';

bo.initialize( lib.config, lib.locales );

const Books = lib.data.models.Books;
let books;

Books.getAll()
  .then( fetched => {
    books = fetched;
    showBefore();
  } );

function showBefore() {
  let out = '';
  books.forEach( book => {
    if (out !== '')
      out += '; ';
    out += book.author + ': ' + book.title;
  } );
  document.getElementById("beforeEdit").innerText = out;
}

function insert() {
  Books.create()
    .then( collection => {
      books = collection;

      books.createItem()
        .then( book1 => {

          book1.author = 'China Miéville';
          book1.title = 'Perdido Station';
          book1.publishDate = '12/12/1995';
          book1.price = 40.0;
          book1.used = true;

          book1.tags.createItem()
            .then( tag1 => {
              tag1.tag = 'sci-fi';

              if (books.isValid())
                books.save()
                  .then( inserted => {
                    books = inserted;
                    showAfter();
                  } );
              else {
                document.getElementById("afterEdit").innerText = books.getBrokenRules();
              }
            } );
        });
    } );
}

function update() {
  const book1 = books.at(0);
  book1.remove();

  books.createItem()
    .then( book3 => {

      book3.author = 'James S. A. Corey';
      book3.title = 'Leviathan Wakes';
      book3.publishDate = '01/01/2012';
      book3.price = 35.0;
      book3.used = false;

      book3.tags.createItem()
        .then( tag1 => {
          tag1.tag = 'sci-fi';

          if (books.isValid())
            books.save()
              .then( saved => {
                books = saved;
                showAfter();
              } );
          else {
            document.getElementById("afterEdit").innerText = books.getBrokenRules();
          }
        } );
    });
}

function remove() {
  books.remove();
  books.save()
    .then( deleted => {
      books = deleted;
      if (books === null)
        document.getElementById("afterEdit").innerText = 'DELETED';
      else
        showAfter();
    } );
}

function showAfter() {
  let out = '';
  books.forEach( book => {
    if (out !== '')
      out += '; ';
    out += book.author + ': ' + book.title;
  } );
  document.getElementById("afterEdit").innerText = out;
}
