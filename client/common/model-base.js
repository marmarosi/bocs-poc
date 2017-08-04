'use strict';

import EventEmitter from '../system/event-emitter.js';

/**
 * Serves as the base class for models.
 *
 * @extends EventEmitter
 */
class ModelBase extends EventEmitter {

  /**
   * Creates a base model instance.
   */
  constructor() {
    super();
  }
}

export default ModelBase;
