'use strict';

/**
 * Specifies the model types. Members:
 *
 *    * EditableRootObject
 *    * EditableRootCollection
 *    * EditableChildObject
 *    * EditableChildCollection
 *    * ReadOnlyRootObject
 *    * ReadOnlyRootCollection
 *    * ReadOnlyChildObject
 *    * ReadOnlyChildCollection
 *    * CommandObject
 *
 * @memberof bo.common
 */
class ModelType {

  /**
   * Creates a new object to define the model types.
   */
  constructor() {

    /**
     * Marks an editable root object.
     * @constant {string}
     * @default EditableRootObject
     */
    this.EditableRootObject = 'EditableRootObject';
    /**
     * Marks an editable root collection.
     * @constant {string}
     * @default EditableRootCollection
     */
    this.EditableRootCollection = 'EditableRootCollection';
    /**
     * Marks an editable child object.
     * @constant {string}
     * @default EditableChildObject
     */
    this.EditableChildObject = 'EditableChildObject';
    /**
     * Marks an editable child collection.
     * @constant {string}
     * @default EditableChildCollection
     */
    this.EditableChildCollection = 'EditableChildCollection';

    /**
     * Marks a read-only root object.
     * @constant {string}
     * @default ReadOnlyRootObject
     */
    this.ReadOnlyRootObject = 'ReadOnlyRootObject';
    /**
     * Marks a read-only root collection.
     * @constant {string}
     * @default ReadOnlyRootCollection
     */
    this.ReadOnlyRootCollection = 'ReadOnlyRootCollection';
    /**
     * Marks a read-only child object.
     * @constant {string}
     * @default ReadOnlyChildObject
     */
    this.ReadOnlyChildObject = 'ReadOnlyChildObject';
    /**
     * Marks a read-only child collection.
     * @constant {string}
     * @default ReadOnlyChildCollection
     */
    this.ReadOnlyChildCollection = 'ReadOnlyChildCollection';

    /**
     * Marks a command object.
     * @constant {string}
     * @default CommandObject
     */
    this.CommandObject = 'CommandObject';

    // Immutable object.
    Object.freeze( this );
  }
}
// Immutable class.
Object.freeze( ModelType );

export default new ModelType();
