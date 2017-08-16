const locales = clt.locales;
const config = {
  userReader: clt.data.getUser,
  localeReader: clt.data.getLocale
};

bo.initialize( config, locales );

let book;

clt.data.models.Book.create()
  .then( created => {
    book = created;
    document.getElementById("publishDate").value = book.publishDate.toLocaleDateString();
  } );

function save() {
  let data = { };

  book.author = document.getElementById("author").value;
  book.title = document.getElementById("title").value;
  book.publishDate = document.getElementById("publishDate").value;
  book.price = document.getElementById("price").value;
  book.used = document.getElementById("used").checked;

  let tag1 = book.tags.createItem();
  tag1.tag = document.getElementById("tag1").value;
  let tag2 = book.tags.createItem();
  tag2.tag = document.getElementById("tag2").value;
  const cnt = book.tags.count;

  if (book.isValid())
    book.save()
      .then( saved => {

        document.getElementById("author").value = saved.author;
        document.getElementById("title").value = saved.title;
        document.getElementById("publishDate").value = saved.publishDate.toString();
        document.getElementById("price").value = saved.price.toString();
        document.getElementById("used").checked = saved.used.toString();

        document.getElementById("tag1").value = saved.tags[ 0 ].tag;
        document.getElementById("tag2").value = saved.tags[ 1 ].tag;
      } );
  else {
    const brs = book.getBrokenRules();
  }
}