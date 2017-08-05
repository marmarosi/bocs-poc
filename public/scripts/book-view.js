const locales = clt.locales;
const config = {
  userReader: clt.data.getUser,
  localeReader: clt.data.getLocale
};

bo.initialize( config, locales );

clt.data.models.BookView.get( 123 )
  .then( book => {
    document.getElementById("author").innerText = book.author;
    document.getElementById("title").innerHTML =
      '<a href="/book-edit/' + book.bookKey + '">' + book.title + '</a>';
    document.getElementById("publishDate").innerText = book.publishDate.toString();
    document.getElementById("price").innerText = book.price.toString();
    document.getElementById("used").innerText = book.used.toString();
  } );
