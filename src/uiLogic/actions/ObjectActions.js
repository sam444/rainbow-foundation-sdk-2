import ObjectService from "../services/ObjectService";
import DataUtils from '../utils/DataUtils';
import ObjectStore from '../stores/ObjectStore';
import ClassCreater from '../utils/ClassCreater';

module.exports = {

    
     // call service by the url parameter to persist modelObject
	 // @param  {Object} modelObject
	 // @param  {String} url
	 // @param  {String} method, default is 'POST'
	 // @param  {Boolean} isCustomized
     // @return {Promise} promise
     
    updateModelObject(modelObject, url, isCustomized, method) {
		return ObjectService.saveModelObject(modelObject, url, method)
			.then(response => {
				let modelObject;
				if (isCustomized) {
					modelObject = response.Model;
				} else {
					modelObject = response;
				}
				ObjectStore.setModelObject(modelObject) ;
				return modelObject;
			});
    },

    
     // call service by the url parameter to create modelObject
	 // @param  {Object} businessObject
	 // @param  {String} url
	 // @param  {Boolean} isCustomized
	 // @param  {String} method, default is POST
     // @return @return {Promise} promise
     
    createModelObjectByBusinessObject(businessObject, url, isCustomized, method) {
		return ObjectService.createModelObjectByBusinessObject(businessObject, url, method)
			.then(response => {
				let modelObject;
				if (isCustomized) {
					modelObject = response.Model;
				} else {
					modelObject = response;
				}
				ObjectStore.setModelObject(modelObject) ;
				return modelObject;
			});
    },

    
     // call service by the url parameter to create model object
	 // @param  {Object} modelObject
	 // @param  {String} url
	 // @param  {Boolean} isCustomized
	 // @param  {String} method, default is 'POST'
     // @return {Promise} promise
     
    createModelObject(modelObject, url, isCustomized, method) {
        return ObjectService.createModelObject(modelObject, url, method)
			.then(response => {
				let modelObject;
				if (isCustomized) {
					modelObject = response.Model;
				} else {
					modelObject = response;
				}
				ObjectStore.setModelObject(modelObject) ;
				return modelObject;
			});
    },

    
     // create an empty modelObject by business object
     // @param  {Object} businessObject
     // @return {Object} modelObject
     
    getEmptyModelObjectByBusinessObject(businessObject) {
        console.assert(businessObject);
		return new Promise((resolve) => {
			const modelObject = DataUtils.createNewDomainObjectByBusinessObject({}, businessObject);
			ObjectStore.setModelObject(modelObject);
			resolve(modelObject);
		});
    },

    
     // load model object
     // @param  {String} url
     // @return {Promise} promise
     
    getModelObject(url) {
		return ObjectService.getModelObject(url)
			.then(response => {
				ObjectStore.setModelObject(response);
				return response;
			});
    }
}

