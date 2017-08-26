'use strict';

import admin from './admin/index.js';
import BookList from './book-list.js';
import BookListItem from './book-list-item.js';
import BookView from './book-view.js';
import Book from './book.js';
import BookTags from './book-tags.js';
import BookTag from './book-tag.js';
import Books from './books.js';
import FindBestseller from './find-bestseller.js';

const index = {
  admin: admin,
  BookList: BookList,
  BookListItem: BookListItem,
  BookView: BookView,
  Book: Book,
  BookTags: BookTags,
  BookTag: BookTag,
  Books: Books,
  FindBestseller: FindBestseller
};

export default index;
