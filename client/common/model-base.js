'use strict';

const events = require('events');

/**
 * Serves as the base class for models.
 *
 * @extends EventEmitter
 */
class ModelBase extends events.EventEmitter {

  /**
   * Creates a base model instance.
   */
  constructor() {
    super();
  }
}

export default ModelBase;
