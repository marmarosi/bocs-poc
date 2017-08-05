const locales = clt.locales;
const config = {
  userReader: clt.data.getUser,
  localeReader: clt.data.getLocale
};

bo.initialize( config, locales );

clt.data.models.BookList.getAll()
  .then( books => {
    let out = "";
    books.forEach( book => {
      out += '<a href="/book-view/' + book.bookKey + '">' +
        book.author + ': ' + book.title + '</a><br>';
    } );
    document.getElementById("books").innerHTML = out;
  } );