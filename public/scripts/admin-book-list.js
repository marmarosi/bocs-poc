const xhr = new XMLHttpRequest();

xhr.onreadystatechange = function() {
  if (this.readyState === 4 && this.status === 200) {
    const books = JSON.parse( this.responseText );
    list( books );
  }
};

xhr.open('POST', '/api/admin/book-list/get-all', true);
xhr.send();

function list( books ) {
  let out = "";
  let i;
  for( i = 0; i < books.length; i++ ) {
    const book = books[i];
    out += '<a href="/book-view/' + book.bookKey + '">' +
      book.author + ': ' + book.title + '</a><br>';
  }
  document.getElementById("books").innerHTML = out;
}
