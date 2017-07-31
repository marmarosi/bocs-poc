'use strict';

import ConnectionManagerBase from './connection-manager-base.js';
import DaoBase from './dao-base.js';
import DaoContext from './dao-context.js';
import daoBuilder from './dao-builder.js';
import DaoError from './dao-error.js';

/**
 * Contains data access components.
 *
 * @namespace bo.dataAccess
 *
 * @property {function} ConnectionManagerBase -
 *     {@link bo.dataAccess.ConnectionManagerBase Base connection manager}
 *      constructor to create new connection manager objects.
 * @property {function} daoBuilder -
 *      {@link bo.dataAccess.daoBuilder Data access object builder}
 *      function to get data access objects.
 * @property {function} DaoBase -
 *      {@link bo.dataAccess.DaoBase Data access object}
 *      constructor to create new data access objects.
 * @property {function} DaoContext -
 *      {@link bo.dataAccess.DaoContext Data access context object}
 *      constructor to create new data context for a data access objects.
 * @property {function} DaoError -
 *      {@link bo.dataAccess.DaoError Data access error}
 *      constructor to create new errors occurred in data access objects.
 */
const index = {
    ConnectionManagerBase: ConnectionManagerBase,
    daoBuilder: daoBuilder,
    DaoBase: DaoBase,
    DaoContext: DaoContext,
    DaoError: DaoError
};

// Immutable object.
Object.freeze( index );

export default index;
