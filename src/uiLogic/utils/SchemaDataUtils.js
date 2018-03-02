import SchemaCache from "./SchemaCache";
import Constants from "../../constants/Constants";


module.exports = {

    /**@private
     * get all business object  of the root business object including itself.
     * @param  {Object} schemaBusinessObject
     * @param  {Array} resultObjectList
     */
        getBusinessObjectsCascade(schemaBusinessObject, resultObjectList) {
        'use strict';
        console.assert(schemaBusinessObject !== null, "schemaBusinessObject is null.");

        // add itself to Array
        if (schemaBusinessObject) {
            resultObjectList.push(schemaBusinessObject);
        }

        // get all child business object it the childElements property
        const childElementObjects = schemaBusinessObject[Constants.CHILD_ELEMENTS];
        if (!_.isEmpty(childElementObjects)) {
            _.forEach(childElementObjects, function (childSchemaList) {
                _.forEach(childSchemaList, function (childSchema) {
                    this.getBusinessObjectsCascade(childSchema, resultObjectList);
                }.bind(this));

            }.bind(this));
        }

    },

    /**@private
     * get all children business object reference keys
     * @param  {Object} schemaBusinessObject
     * @return  {Array} keys
     */
        getChildrenBusinessObjectKeyByBusinessObject(schemaBusinessObject){
        'use strict';
        const childElementObjects = schemaBusinessObject[Constants.CHILD_ELEMENTS];
        if (childElementObjects) {
            return Object.keys(childElementObjects);
        }

    },

    /**@private
     * get business object by unique key
     * @param  {Number} objectId
     * @param  {Array} allSchemaObjects
     * @return  {Object} matched business object
     */
        getBusinessObjectById(objectId, allSchemaObjects) {
        'use strict';
        if (!_.isEmpty(allSchemaObjects)) {
            const matchedBusinessObject = _.find(allSchemaObjects, function (schemaObject) {
                return schemaObject[Constants.COMM_PK] === objectId;
            });
            console.assert(matchedBusinessObject, "There is no matched business object");
            return matchedBusinessObject;
        }
    },

    /**@private
     * get business object by unique key
     * @param  {Number} objectId
     * @param  {Array} allSchemaObjects
     * @return  {Object} matched business object
     */
    getBusinessObjectByType(incObject, allSchemaObjects) {
        'use strict';
        if (!_.isEmpty(allSchemaObjects)) {
            const matchedBusinessObject = _.find(allSchemaObjects, function (schemaObject) {
                return schemaObject[Constants.COMM_TYPE] === incObject[Constants.COMM_TYPE];
            });
            console.assert(matchedBusinessObject, "There is no matched business object");
            return matchedBusinessObject;
        }
    },

    /**@private
     * get matched Business Object Array
     * @param  {String} modelName
     * @param  {String} objectCode
     * @param  {Array} allSchemaObjects
     * @return  {Array} matched business objects
     */
        getBusinessObjectByModelNameAndCode(modelName, objectCode, allSchemaObjects) {
        'use strict';
        console.assert(modelName, "Model name is null");
        console.assert(objectCode, "Object code is null");

        if (!_.isEmpty(allSchemaObjects)) {
            const matchedBusinessObject = _.where(allSchemaObjects, {ModelName: modelName, ObjectCode: objectCode});
            return matchedBusinessObject;
        }
    },

    /**@private
     * get matched Business Object under the scope business object
     * @param  {String} modelName
     * @param  {String} objectCode
     * @param  {Object} scopeBusinessObject
     * @return  {Object} matched business object
     */
        getBusinessObjectByModelNameAndCodeInScopeBusinessObject(modelName, objectCode, scopeBusinessObject) {
        'use strict';
        console.assert(modelName, "Model name is null.");
        console.assert(objectCode, "Object code is null.");
        console.assert(scopeBusinessObject, "scopeBusinessObject is null.");

        let cacheKey = modelName + Constants.CONNECT_KEY + objectCode + Constants.CONNECT_KEY + scopeBusinessObject[Constants.COMM_PK] + Constants.CONNECT_KEY + Constants.BUSINESS_MODEL_CODE_MATCHED_CACHE;
        if (SchemaCache[cacheKey]) {
            return SchemaCache[cacheKey];
        } else {

            const allSchemaObjects = this.getAllBusinessObjectInScopeBusinessObjectByCache(scopeBusinessObject);

            if (!_.isEmpty(allSchemaObjects)) {
                const matchedBusinessObject = _.where(allSchemaObjects, {ModelName: modelName, ObjectCode: objectCode});
                console.assert(_.size(matchedBusinessObject) === 1, "There is no matched business object or more than one.(modelName:" + modelName + ", objectCode:" + objectCode + ")");
                SchemaCache[cacheKey] = matchedBusinessObject[0];
                return matchedBusinessObject[0];
            }
        }

    },

    /**@private
     * get matched Business Object under the scope business object
     * @param  {Number} businessObjectId
     * @param  {Object} scopeBusinessObject
     * @return  {Object} matched business object
     */
        getBusinessObjectByBusinessObjectIdInScopeBusinessObject(businessObjectId, scopeBusinessObject) {
        'use strict';
        console.assert(businessObjectId, "businessObjectId is null.");
        console.assert(scopeBusinessObject, "scopeBusinessObject is null.");

        const cacheKey = businessObjectId + Constants.CONNECT_KEY + scopeBusinessObject[Constants.COMM_PK] + Constants.BUSINESS_OBJECT_MATCHED_CACHE;
        if (SchemaCache[cacheKey]) {
            return SchemaCache[cacheKey];
        } else {
            const allSchemaObjects = this.getAllBusinessObjectInScopeBusinessObjectByCache(scopeBusinessObject);
            if (!_.isEmpty(allSchemaObjects)) {
                const matchedBusinessObject = _.filter(allSchemaObjects, function (businessObject) {
                    return businessObject[Constants.COMM_PK] === businessObjectId;
                });
                console.assert(_.size(matchedBusinessObject) === 1, "There is no matched business object or more than one.");
                SchemaCache[cacheKey] = matchedBusinessObject[0];
                return matchedBusinessObject[0];
            }
        }


    },

    /**@private
     * get all matched Business Object under the scope business object by cache
     * @param  {Object} scopeBusinessObject
     * @return  {Array} all business object
     */
        getAllBusinessObjectInScopeBusinessObjectByCache(scopeBusinessObject){
        'use strict';
        const allCacheKey = scopeBusinessObject[Constants.COMM_PK] + Constants.CONNECT_KEY + Constants.ALL_BUSINESS_OBJECT_CACHE;
        let allSchemaObjects = [];
        if (SchemaCache[allCacheKey]) {
            allSchemaObjects = SchemaCache[allCacheKey];
        } else {
            this.getBusinessObjectsCascade(scopeBusinessObject, allSchemaObjects);
            SchemaCache[allCacheKey] = allSchemaObjects;
        }
        return allSchemaObjects;
    },


    /**@private
     * get all matched Business Object under the scope business object
     * @param  {String} modelName
     * @param  {Array} objectCodes
     * @param  {Object} scopeBusinessObject
     * @return  {Array} all matched business object
     */
        getAllBusinessObjectByModelNameAndCodesInScopeBusinessObject(modelName, objectCodes, scopeBusinessObject){
        'use strict';
        console.assert(modelName, "modelName is null");
        console.assert(scopeBusinessObject, "scopeBusinessObject is null");
        const cacheKey = modelName + Constants.CONNECT_KEY + objectCodes + Constants.CONNECT_KEY + scopeBusinessObject[Constants.COMM_PK] + Constants.ALL_BUSINESS_OBJECT_MATCHED_CACHE;

        if (SchemaCache[cacheKey]) {
            return SchemaCache[cacheKey];
        } else {
            const allSchemaObjects = this.getAllBusinessObjectInScopeBusinessObjectByCache(scopeBusinessObject);
            let matchedBusinessObject = [];
            if (!_.isEmpty(allSchemaObjects)) {
                // the object is not null, return code matched ones,else return all by model name
                if (!_.isEmpty(objectCodes)) {
                    matchedBusinessObject = _.filter(allSchemaObjects, function (businessObject) {
                        return modelName === businessObject[Constants.DD_MODEL_NAME] && _.contains(objectCodes, businessObject[Constants.DD_OBJECT_CODE]);
                    });

                } else {
                    matchedBusinessObject = _.filter(allSchemaObjects, function (businessObject) {
                        return modelName === businessObject[Constants.DD_MODEL_NAME];
                    });
                }

            }
            SchemaCache[cacheKey] = matchedBusinessObject;
            return matchedBusinessObject;
        }
    },

    /**@private
     * get child's business object by business object Id
     * @param  {Array} childBusinessObjects
     * @param  {Number} businessObjectId
     * @return  {Object} the matched business object
     */
        getChildBusinessObjectByBusinessObjectId(childBusinessObjects, businessObjectId){
        'use strict';
        console.debug("childBusinessObjects:", childBusinessObjects);
        console.debug("businessObjectId:", businessObjectId);
        console.assert(_.size(childBusinessObjects) > 0, "childBusinessObjects is null.");
        console.assert(businessObjectId, "businessObjectId is null.");

        // build cache key
        let matchedBusinessObject = null;
        const resultCacheKey = Constants.ChildBusinessObjectInArray + Constants.CONNECT_KEY + businessObjectId;
        if (SchemaCache[resultCacheKey]) {
            matchedBusinessObject = SchemaCache[resultCacheKey];
            console.debug("matchedBusinessObject in cache:", matchedBusinessObject);
            return matchedBusinessObject;
        }

        console.debug("childBusinessObjects:", childBusinessObjects);

        const childBusinessObjectCacheKey = Constants.ChildBusinessObjectArray + Constants.CONNECT_KEY + businessObjectId;
        let childBusinessObjectValues = null;

        if (SchemaCache[childBusinessObjectCacheKey]) {
            childBusinessObjectValues = SchemaCache[childBusinessObjectCacheKey];
        } else {
            childBusinessObjectValues = _.flatten(_.values(childBusinessObjects));
            SchemaCache[childBusinessObjectCacheKey] = childBusinessObjectValues;
        }

        matchedBusinessObject = _.find(childBusinessObjectValues, function (childBusinessObject) {
            return childBusinessObject[Constants.COMM_PK] === businessObjectId;
        });
        console.assert(matchedBusinessObject, "There is no matched businessObject.");
        SchemaCache[resultCacheKey] = matchedBusinessObject;
        return matchedBusinessObject;
    }
};
