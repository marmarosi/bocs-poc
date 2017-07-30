'use strict';

import Enumeration from '../system/enumeration.js';

/**
 * Represents the eligible attributes of
 * a {@link bo.common.PropertyInfo property definition}.
 *
 * @memberof bo.common
 * @extends bo.system.Enumeration
 */
class PropertyFlag extends Enumeration {

  /**
   * Creates a new object containing the property flag set.
   */
  constructor() {
    super();

    /**
     * None of the property flags.
     * @constant {number} bo.common.PropertyFlag#none
     * @default 0
     */
    this.none = 0;
    /**
     * The model property cannot be set.
     * @constant {number} bo.common.PropertyFlag#readOnly
     * @default 1
     */
    this.readOnly = 1;
    /**
     * The model property is a key element of the model.
     * @constant {number} bo.common.PropertyFlag#key
     * @default 2
     */
    this.key = 2;
    /**
     * The model property is a key element of the parent model.
     * @constant {number} bo.common.PropertyFlag#parentKey
     * @default 4
     */
    this.parentKey = 4;
    /**
     * The value of the model property will be used on the client transfer object only.
     * @constant {number} bo.common.PropertyFlag#onCtoOnly
     * @default 8
     */
    this.onCtoOnly = 8;
    /**
     * The value of the model property will be used on the data transfer object only.
     * @constant {number} bo.common.PropertyFlag#onDtoOnly
     * @default 16
     */
    this.onDtoOnly = 16;

    // Immutable object.
    Object.freeze( this );
  }
}

export default new PropertyFlag();
