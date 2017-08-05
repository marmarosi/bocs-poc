'use strict';

import admin from './admin/index.js';
import BookList from './book-list.js';
import BookListItem from './book-list-item.js';

const index = {
  admin: admin,
  BookList: BookList,
  BookListItem: BookListItem
};

export default index;
