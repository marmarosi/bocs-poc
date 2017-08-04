'use strict';

import EventEmitter from '../system/event-emitter.js';

/**
 * Serves as the base class for collections.
 *
 * @extends EventEmitter
 */
class CollectionBase extends EventEmitter {

  /**
   * Creates a base collection instance.
   */
  constructor() {
    super();
  }
}

export default CollectionBase;
