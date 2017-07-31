'use strict';

import Enumeration from '../system/enumeration.js';

/**
 * Specifies the operations of models to authorize. Members:
 *
 *    * fetchObject
 *    * createObject
 *    * updateObject
 *    * removeObject
 *    * executeCommand
 *    * executeMethod
 *    * readProperty
 *    * writeProperty
 *
 * @memberof bo.rules
 * @extends bo.system.Enumeration
 */
class AuthorizationAction extends Enumeration {

  /**
   * Creates a new enumeration to define the authorization actions.
   */
  constructor() {
    super();

    /**
     * The user tries to retrieve the values of a model from the repository.
     * @constant {number} bo.rules.AuthorizationAction#fetchObject
     * @default 0
     */
    this.fetchObject = 0;
    /**
     * The user tries to save the values of a new model to the repository.
     * @constant {number} bo.rules.AuthorizationAction#createObject
     * @default 1
     */
    this.createObject = 1;
    /**
     * The user tries to save the changed values of a model to the repository.
     * @constant {number} bo.rules.AuthorizationAction#updateObject
     * @default 2
     */
    this.updateObject = 2;
    /**
     * The user tries to delete the values of a model from the repository.
     * @constant {number} bo.rules.AuthorizationAction#removeObject
     * @default 3
     */
    this.removeObject = 3;

    /**
     * The user tries to execute a command in the repository.
     * @constant {number} bo.rules.AuthorizationAction#executeCommand
     * @default 4
     */
    this.executeCommand = 4;
    /**
     * The user tries to execute a custom action in the repository.
     * @constant {number} bo.rules.AuthorizationAction#executeMethod
     * @type {number}
     * @default 5
     */
    this.executeMethod = 5;

    /**
     * The user tries to get the value of a property.
     * @constant {number} bo.rules.AuthorizationAction#readProperty
     * @default 6
     */
    this.readProperty = 6;
    /**
     * The user tries to set the value of a property.
     * @constant {number} bo.rules.AuthorizationAction#writeProperty
     * @default 7
     */
    this.writeProperty = 7;

    // Immutable object.
    Object.freeze( this );
  }
}

export default new AuthorizationAction();
