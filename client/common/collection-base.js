'use strict';

const events = require( 'events' );

/**
 * Serves as the base class for collections.
 *
 * @extends EventEmitter
 */
class CollectionBase extends events.EventEmitter {

  /**
   * Creates a base collection instance.
   */
  constructor() {
    super();
  }
}

export default CollectionBase;
