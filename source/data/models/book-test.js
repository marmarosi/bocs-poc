'use strict';

import BookTagsView from './book-tags-view.js';

const Model = bo.ModelComposer;
const F = bo.common.PropertyFlag;
const cr = bo.commonRules;
const ApiClientBase = bo.apiAccess.ApiClientBase.default;

//region Test API client

class ApiClientMock extends ApiClientBase {

  constructor( config ) {
    super();
  }

  call( modelUri, apiMethod, altName, data ) {
    return new Promise( ( fulfill, reject ) => {

      switch (altName || apiMethod) {
        case 'get':
          fulfill( {
            bookKey: 101,
            author: 'Mario Vargas Llosa',
            title: 'Háború a világ végén',
            publishDate: 1987,
            price: 5000,
            used: false,
            tags: [
              { bookTagKey: 50, bookKey: 101, tag: 'széppróza' },
              { bookTagKey: 60, bookKey: 101, tag: 'perui' }
            ]
          } );
          break;
        default:
          reject( new Error( 'Invalid method: ' + (altName || apiMethod) ) );
      }
    } );
  }
}

function ApiClientMockFactory( config ) {
  return new ApiClientMock( config );
}

//endregion

const BookTest = new Model( 'BookTest : book-view' )
  .readOnlyRootObject( 'memdb', __filename )
  // --- Properties
  .integer( 'bookKey', F.key )
  .text( 'author' )
  .text( 'title' )
  .dateTime( 'publishDate' )
  .decimal( 'price' )
    .canRead( cr.isInAnyRole, [ 'salesmen', 'administrators' ], 'You are not authorized to view the price of the book.' )
  .boolean( 'used' )
  .property( 'tags', BookTagsView )
  // --- Permissions
  .canFetch( cr.isInRole, 'designers', 'You are not authorized to retrieve book.' )
  // --- Extensions
  .acoBuilder( ApiClientMockFactory )
  // --- Build model class
  .compose();

class BookTestFactory {
  get( key, eventHandlers ) {
    return BookTest.fetch( key, 'get', eventHandlers );
  }
  getByTitle( title, eventHandlers ) {
    return BookTest.fetch( title, 'get-by-title', eventHandlers );
  }
}

export default new BookTestFactory();
