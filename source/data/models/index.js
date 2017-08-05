'use strict';

import admin from './admin/index.js';
import BookList from './book-list.js';
import BookListItem from './book-list-item.js';
import BookView from './book-view.js';

const index = {
  admin: admin,
  BookList: BookList,
  BookListItem: BookListItem,
  BookView: BookView
};

export default index;
