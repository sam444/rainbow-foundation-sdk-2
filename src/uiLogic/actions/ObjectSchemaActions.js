import SchemaCacheService from "../services/SchemaCacheService";
import ObjectSchemaStore from '../stores/ObjectSchemaStore';
import ClassCreater from '../utils/ClassCreater';

module.exports = {

    /**@private
     * get schema data by modelName, objectCode and productId
     * @param  {String} modelName
     * @param  {String} objectCode
     * @param  {Number} referenceId
	 * @param  {Number} contextType
     * @return {Promise} promise
     */
    getModelObjectSchema(modelName, objectCode, referenceId, contextType) {
        console.assert(referenceId !== null, "referenceId is null.");
		return SchemaCacheService.getSchemaData(modelName, objectCode, referenceId, contextType)
			.then(schema => {
				ObjectSchemaStore.refreshModelObjectSchemaData(referenceId,schema);
				return schema;
			});
    }
}

