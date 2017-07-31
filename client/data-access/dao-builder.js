'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
import DaoBase from './dao-base.js';
import DaoError from './dao-error.js';

/**
 * Factory method to create the data access object for a model instance.
 * The path of the data access object is created using the model path and
 * inserted the data source string before the extension. (The model name
 * is not used by this implementation.)
 *
 * @function bo.dataAccess.daoBuilder
 * @param {string} dataSource - The name of the data source.
 * @param {string} modelPath - The model definition path of the business
 *      object model instance that the data access object belongs to.
 * @param {string} modelName - The name of the business object model.
 * @returns {bo.dataAccess.DaoBase} The data access object of the business object model.
 *
 * @throws {@link bo.dataAccess.DaoError Dao error}: The name of the data source must be a non-empty string.
 * @throws {@link bo.dataAccess.DaoError Dao error}: The model path must be a non-empty string.
 * @throws {@link bo.dataAccess.DaoError Dao error}: The model path is not a valid file path.
 * @throws {@link bo.dataAccess.DaoError Dao error}: The required data access file does not exist.
 * @throws {@link bo.dataAccess.DaoError Dao error}: The data access file must return a constructor.
 * @throws {@link bo.dataAccess.DaoError Dao error}: The data access object must inherit DaoBase type.
 *
 * @example
 * daoBuilder('oracle', '/path/to/model.js')
 * // returns require('/path/to/model.oracle.js')
 */
const daoBuilder = function ( dataSource, modelPath, modelName ) {

  if (typeof dataSource !== 'string' || dataSource.trim().length === 0)
    throw new DaoError( 'f_manString', 'dataSource' );
  if (typeof modelPath !== 'string' || modelPath.trim().length === 0)
    throw new DaoError( 'f_manString', 'modelPath' );
  if (typeof modelName !== 'string' || modelName.trim().length === 0)
    throw new DaoError( 'f_manString', 'modelName' );

  const modelStats = fs.statSync( modelPath );
  if (!modelStats.isFile())
    throw new DaoError( 'filePath', 'modelPath', modelPath );

  const daoPath = path.join(
    path.dirname( modelPath ),
    path.basename( modelPath, path.extname( modelPath ) ) + '.' + dataSource + path.extname( modelPath )
  );

  const daoStats = fs.statSync( daoPath );
  if (!daoStats.isFile())
    throw new DaoError( 'noDaoFile', daoPath );

  const daoConstructor = require( daoPath );

  if (typeof daoConstructor !== 'function')
    throw new DaoError( 'daoCtor', daoPath );

  const daoInstance = new daoConstructor();
  if (!(daoInstance instanceof DaoBase) && daoInstance.super_ !== DaoBase)
    throw new DaoError( 'daoType', daoPath );
  return daoInstance;
};

export default daoBuilder;
