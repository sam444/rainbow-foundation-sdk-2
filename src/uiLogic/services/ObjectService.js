import unicornUiLogicConfigConstants from "../../constants/UrlConfigConstants";
import CacheConstants from "../../constants/Constants";
import DataUtils from '../utils/DataUtils';


module.exports = {

    /**@private
     * get modelObject.
     * @param  {String} url
     * @return {Promise} promise
     */
    getModelObject: function (url) {
        'use strict';
		if (!url.match(/^http/)) {
			if (url.startsWith('/')) url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + url;
			else url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + '/' + url;
		}
        return AjaxUtil.call(url, null, {method: 'GET'});
    },

    /**@private
     * save model object
     * @param  {Object} modelObject
	 * @param  {String} url
	 * @param  {String} method, default is 'POST'
     * @return  {Promise} promise
     */
    saveModelObject: function (modelObject, url, method) {
        'use strict';
        this.clearDirtyData(modelObject);
        console.info("saveModelObject...");
        const id = modelObject[CacheConstants.COMM_PK];

        if (!id) {
            throw new Error("This model object doesn't exist");
        }

		if (!url.match(/^http/)) {
			if (url.startsWith('/')) url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + url;
			else url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + '/' + url;
		}
		return AjaxUtil.call(url, modelObject, {method: method || 'POST'});
    },

    /**@private
     * persist a new model object
	 * @param  {Object} modelObject
	 * @param  {String} url
	 * @param  {String} method, default is 'POST'
     * @return {Promise} promise
     */
    createModelObject: function (modelObject, url, method) {
        'use strict';
        this.clearDirtyData(modelObject);
		if (!url.match(/^http/)) {
			if (url.startsWith('/')) url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + url;
			else url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + '/' + url;
		}
		return AjaxUtil.call(url, modelObject, {method: method || 'POST'});
    },

    /**@private
     * to create model object by the url parameter
	 * @param  {Object} businessObject
     * @param  {String} url
     * @param  {String} method, default is POST
     * @return {Promise} promise
     */
    createModelObjectByBusinessObject: function (businessObject, url, method) {
        'use strict';
        console.assert(url !== null, "url is null.");
        console.assert(businessObject !== null, "businessObject is null.");
		if (!url.match(/^http/)) {
			if (url.startsWith('/')) url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + url;
			else url = unicornUiLogicConfigConstants.API_GATEWAY_PROXY + '/' + url;
		}
        let modelObject = DataUtils.createNewDomainObjectByBusinessObject(null, businessObject);
		return AjaxUtil.doPost(url, modelObject, {method: method || 'POST'});
    },
	
    /**@private
     * to clean temp data under modelObject
     * @param  {Object} modelObject
     */
        clearDirtyData(modelObject){
        'use strict';
        delete modelObject[CacheConstants.IS_DIRTY_FLG];
        delete modelObject[CacheConstants.DIRTY_OBJECT];
        delete modelObject[CacheConstants.VERSION_FOR_CLIENT];
        delete modelObject[CacheConstants.STATUS];

    }

};
