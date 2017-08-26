const locales = clt.locales;
const config = {
  userReader: clt.data.getUser,
  localeReader: clt.data.getLocale
};

bo.initialize( config, locales );

const FindBestseller = clt.data.models.FindBestseller;

function find() {
  const finder = FindBestseller.create();
  finder.publishYear = document.getElementById("publishYear").value;
  finder.tag1 = document.getElementById("tag_1").value;
  finder.tag2 = document.getElementById("tag_2").value;
  finder.tag3 = document.getElementById("tag_3").value;

  finder.inYearByTags()
    .then( cmd => {

      document.getElementById("author").innerText = cmd.result.author;
      document.getElementById("title").innerHTML =
        '<a href="/book-edit/' + cmd.bookKey + '">' + cmd.result.title + '</a>';
      document.getElementById("publishDate").innerText = cmd.result.publishDate.toString();
      document.getElementById("price").innerText = cmd.result.price.toString();
      document.getElementById("used").innerText = cmd.result.used.toString();

      let tags = '';
      cmd.result.tags.forEach( tag => {
        if (tags)
          tags += ', ';
        tags += tag.tag;
      } );
      document.getElementById("tags").innerText = tags;
    } );
}