const locales = clt.locales;
const config = {
  userReader: clt.data.getUser,
  localeReader: clt.data.getLocale
};

bo.initialize( config, locales );

let books;

clt.data.models.Books.getAll()
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

function save() {
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
        } );
      if (books.isValid())
        books.save()
          .then( saved => {
            books = saved;
            showAfter();
          } );
      else {
        document.getElementById("afterEdit").innerText = books.getBrokenRules();
      }
    });
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
