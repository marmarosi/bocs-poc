'use strict';

import Enumeration from '../system/enumeration.js';

/**
 * Specifies the operations of models to execute on API access objects. Members:
 *
 *    * create
 *    * fetch
 *    * insert
 *    * update
 *    * remove
 *    * execute
 *
 * @memberof bo.apiAccess
 * @extends bo.system.Enumeration
 */
class ApiClientAction extends Enumeration {

  /**
   * Creates a new enumeration to define the API portal actions.
   */
  constructor() {
    super();

    /**
     * The user tries to initialize the values of a new model from the API portal.
     * @constant {number} bo.apiAccess.ApiClientAction#create
     * @default 0
     */
    this.create = 0;
    /**
     * The user tries to retrieve the values of a model from the API portal.
     * @constant {number} bo.apiAccess.ApiClientAction#fetch
     * @default 1
     */
    this.fetch = 1;
    /**
     * The user tries to save the values of a new model to the API portal.
     * @constant {number} bo.apiAccess.ApiClientAction#insert
     * @default 2
     */
    this.insert = 2;
    /**
     * The user tries to save the changed values of a model to the API portal.
     * @constant {number} bo.apiAccess.ApiClientAction#update
     * @default 3
     */
    this.update = 3;
    /**
     * The user tries to delete the values of a model from the API portal.
     * @constant {number} bo.apiAccess.ApiClientAction#remove
     * @default 4
     */
    this.remove = 4;

    /**
     * The user tries to execute a command in the API portal.
     * @constant {number} bo.apiAccess.ApiClientAction#execute
     * @default 5
     */
    this.execute = 5;

    // Immutable object.
    Object.freeze( this );
  }
}

export default new ApiClientAction();
