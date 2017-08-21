const locales = clt.locales;
const config = {
  userReader: clt.data.getUser,
  localeReader: clt.data.getLocale
};

bo.initialize( config, locales );

let book;

clt.data.models.Book.get( 22 )
  .then( fetched => {
    book = fetched;
    show();
  } );

function show() {

  document.getElementById("key").innerText = book.bookKey;
  document.getElementById("author").value = book.author;
  document.getElementById("title").value = book.title;
  document.getElementById("publishDate").value = book.publishDate.toLocaleDateString();
  document.getElementById("price").value = book.price.toString();
  document.getElementById("used").checked = book.used;

  document.getElementById("tag1").value = book.tags.at( 0 ).tag;
  document.getElementById("tag2").value = book.tags.at( 1 ).tag;
}

function save() {
  let data = { };

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
        show();
      } );
  else {
    const brs = book.getBrokenRules();
  }
}