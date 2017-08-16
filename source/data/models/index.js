'use strict';

import admin from './admin/index.js';
import BookList from './book-list.js';
import BookListItem from './book-list-item.js';
import BookView from './book-view.js';
import Book from './book.js';
import BookTags from './book-tags.js';
import BookTag from './book-tag.js';

const index = {
  admin: admin,
  BookList: BookList,
  BookListItem: BookListItem,
  BookView: BookView,
  Book: Book,
  BookTags: BookTags,
  BookTag: BookTag
};

export default index;
