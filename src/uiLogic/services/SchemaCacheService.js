import CacheConstants from "../../constants/Constants";
import UrlConfigConstants from '../../constants/UrlConfigConstants';
import SchemaCacheData from "../utils/SchemaCacheData";
import { SessionContext } from 'rainbow-foundation-cache';


module.exports = {

    /**@private
     * get schema cache data key by productId, modelName, objectCode.
     * @param  {Number} productId
     * @param  {String} modelName
     * @param  {String} objectCode
     * @return {String} cache key
     */
    getSchemaCacheKey(productId, modelName, objectCode) {
        'use strict';
        //return productId + CacheConstants.COMM_CONNECTOR + modelName + '-' + objectCode + CacheConstants.COMM_CONNECTOR + CacheConstants.DD_SCHEMA_DATA;
        return productId;
    },

    /**@private
     * get schema cache data  by productId, modelName and objectCode.
     * @param  {Number} productId
	 * @param  {String} modelName
	 * @param  {String} objectCode
     * @return {Object} business Object
     */
    getSchemaCache(productId, modelName, objectCode) {
        'use strict';
        let schemaCacheDataKey = this.getSchemaCacheKey(productId, modelName, objectCode);
        return SchemaCacheData[schemaCacheDataKey];
    },

    /**@private
     * get schema cache data version  by productId, modelName and objectCode.
     * @param  {Number} productId
	 * @param  {String} modelName
	 * @param  {String} objectCode
     * @return {String} version
     */
    getSchemaCacheVersion(productId, modelName, objectCode) {
        'use strict';
        let schemaCacheDataKey = this.getSchemaCacheKey(productId, modelName, objectCode);
        if (SchemaCacheData[schemaCacheDataKey]) {
            let productSchemaCacheData = SchemaCacheData[schemaCacheDataKey];
            return productSchemaCacheData[CacheConstants.UI_CACHE_VERSION];
        }
    },

    /**@private
     * get schema  data
     * @param  {Number} contextType
     * @param  {Number} referenceId
	 * @param  {String} modelName
	 * @param  {String} objectCode
     * @return {Object} promise
     */
    getSchemaData: function (modelName, objectCode, referenceId, contextType) {
        'use strict';
        let schemaKey = this.getSchemaCacheKey(referenceId, modelName, objectCode);
        let uiProductSchemaData = SessionContext.get(schemaKey);
        return new Promise((resolve, reject) => {
            if (uiProductSchemaData) {
                resolve(uiProductSchemaData);
            } else {
                let data = {
                    modelName: modelName,
                    objectCode: objectCode,
                    contextType: contextType || CacheConstants.PRODUCT_CONTEXT_TYPE,
                    referenceId: referenceId
                };
                AjaxUtil.call(UrlConfigConstants.DD.product_dd_schema, data, { method: 'GET' })
                    .then(response => {
                        SessionContext.put(schemaKey,response,true)
                        resolve(response)
                    });
            }

        });
    }
};
