'use strict';

import Enumeration from '../system/enumeration.js';

/**
 * Specifies the events of models' API portal operations. Members:
 *
 *    * preFetch, postFetch
 *    * preCreate, postCreate
 *    * preInsert, postInsert
 *    * preUpdate, postUpdate
 *    * preRemove, postRemove
 *    * preExecute, postExecute
 *    * preSave, postSave
 *
 * @memberof bo.apiAccess
 * @extends bo.system.Enumeration
 */
class ApiClientEvent extends Enumeration {

  /**
   * Creates a new enumeration to define the API portal events.
   */
  constructor() {
    super();

    /**
     * The event before an API portal fetch operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#preFetch
     * @default 0
     */
    this.preFetch = 0;
    /**
     * The event after an API portal fetch operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#postFetch
     * @default 1
     */
    this.postFetch = 1;
    /**
     * The event before an API portal create operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#preCreate
     * @default 2
     */
    this.preCreate = 2;
    /**
     * The event after an API portal create operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#postCreate
     * @default 3
     */
    this.postCreate = 3;
    /**
     * The event before an API portal insert operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#preInsert
     * @default 4
     */
    this.preInsert = 4;
    /**
     * The event after an API portal insert operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#postInsert
     * @default 5
     */
    this.postInsert = 5;
    /**
     * The event before an API portal update operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#preUpdate
     * @default 6
     */
    this.preUpdate = 6;
    /**
     * The event after an API portal update operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#postUpdate
     * @default 7
     */
    this.postUpdate = 7;
    /**
     * The event before an API portal remove operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#preRemove
     * @default 8
     */
    this.preRemove = 8;
    /**
     * The event after an API portal remove operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#postRemove
     * @default 9
     */
    this.postRemove = 9;
    /**
     * The event before an API portal execute operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#preExecute
     * @default 10
     */
    this.preExecute = 10;
    /**
     * The event after an API portal execute operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#postExecute
     * @default 11
     */
    this.postExecute = 11;
    /**
     * The event before an API portal save operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#preSave
     * @default 12
     */
    this.preSave = 12;
    /**
     * The event after an API portal save operation.
     * @constant {number} bo.apiAccess.ApiClientEvent#postSave
     * @default 13
     */
    this.postSave = 13;

    // Immutable object.
    Object.freeze( this );
  }
}

export default new ApiClientEvent();
