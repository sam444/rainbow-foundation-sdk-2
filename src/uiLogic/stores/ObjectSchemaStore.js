import Constants from "../../constants/Constants";
import SchemaDataUtils from "../utils/SchemaDataUtils";
import ClassCreater from '../utils/ClassCreater';
import { SessionContext } from 'rainbow-foundation-cache';


module.exports = {

    getAllSchemaObjects() {
        const key = SessionContext.get(Constants.SESSION_SCHEMA_KEY_OBJECT);
        const _allSchemaObjects = SessionContext.get(key);

        if (_allSchemaObjects) {
            return _allSchemaObjects;
        } else {
            return [];
        }
    },

    getAllSchemaObjectsBykey(key) {
        //handel sessionStore load delay
        SessionContext.put(Constants.SESSION_SCHEMA_KEY_OBJECT, Constants.SESSION_SCHEMA_KEY_OBJECT + key);
        SessionContext.put(Constants.SESSION_SCHEMA_KEY_OBJECT, Constants.SESSION_SCHEMA_KEY_OBJECT + key, true);
        return this.getAllSchemaObjects();
    },

    getModelObjectSchemaData(key) {
        const _modelObjectSchemaData = SessionContext.get(Constants.SESSION_SCHEMA_KEY_OBJECT + key);
        if (_modelObjectSchemaData) {
            return _modelObjectSchemaData;
        } else {
            return {};
        }
    },

    /**@private
     * refresh object schema data from action's return value,which includes object data.
     */
    // refreshModelObjectSchemaWithObject(payload) {
    //     const allSchemaObjects = [];
    //     const modelObjectSchemaData = payload.modelObjectSchema;
    //     SchemaDataUtils.getBusinessObjectsCascade(modelObjectSchemaData, allSchemaObjects);

    //     if (global) {
    //         global['AllSchemaObject'] = allSchemaObjects;
    //     }
    //     SessionContext.put(Constants.SESSION_SCHEMA_KEY_OBJECT, allSchemaObjects);
    //     SessionContext.put(Constants.SESSION   _POLICY_SCHEMA_KEY_DATA, modelObjectSchemaData, true);

    // },

    /**@private
     * refresh modelObject schema data from action's return value.
     * @param  {Object} modelObjectSchemaData
     */
    refreshModelObjectSchemaData(key, modelObjectSchemaData) {
        let allSchemaObjects = [];
        SchemaDataUtils.getBusinessObjectsCascade(modelObjectSchemaData, allSchemaObjects);
        SessionContext.put(Constants.SESSION_SCHEMA_KEY_OBJECT + key, allSchemaObjects);
    },

    /**@private
     * get modelObject schema data from modelObject schema store's state.
     * @return  {Object} modelObjectSchemaData
     */
    getRootSchemaData() {
        const key = SessionContext.get(Constants.SESSION_CURRENT_SCHEMA_KEY_DATA);
        return this.getModelObjectSchemaData(key);
    },


    /**@private
     * get direct parent business object of childBusinessObject in the scope business object
     * @param  {Object} childBusinessObject
     * @param  {Object} scopeBusinessObject
     * @return  {Object} parentBusinessObject
     */
    getParentBusinessObjectByChildBusinessObject(childBusinessObject, scopeBusinessObject) {

        // if the scope business object is null,then set the default value
        if (!scopeBusinessObject) {
            scopeBusinessObject = this.getRootSchemaData();
        }

        let allScopeSchemaObjects = [];

        const childBusinessObjectId = childBusinessObject[Constants.COMM_PK];
        // get all schema object
        SchemaDataUtils.getBusinessObjectsCascade(scopeBusinessObject, allScopeSchemaObjects);

        console.assert(_.size(allScopeSchemaObjects), "There is no schema object");
        if (!_.isEmpty(allScopeSchemaObjects)) {

            const matchedParentBusinessObject = _.filter(allScopeSchemaObjects, function (schemaObject) {
                if (schemaObject[Constants.CHILD_ELEMENTS]) {
                    let childBusinessObjects = _.flatten(_.values(schemaObject[Constants.CHILD_ELEMENTS]));
                    // try to match by child element
                    let matchedChildBusinessObject = _.find(childBusinessObjects, function (childSchemaObject) {
                        return childBusinessObjectId === childSchemaObject[Constants.COMM_PK];
                    });

                    if (matchedChildBusinessObject) {
                        return matchedChildBusinessObject;
                    }

                }
            });


            // just find unique parent business object, it is fine
            console.assert(_.size(matchedParentBusinessObject) === 1, "The parent can not be found or find more than one.");
            return matchedParentBusinessObject[0];
        }


    },

    /**@private
     * get  business object  by business object Id in the all schema object
     * @param  {Number} businessObjectId
     * @return  {Object} BusinessObject
     */
    getBusinessObjectByObjectId(businessObjectId) {
        const allBusinessObject = this.getAllSchemaObjects();
        if (!_.isEmpty(allBusinessObject)) {
            const matchedBusinessObject = _.find(allBusinessObject, function (businessObject) {
                return businessObject[Constants.COMM_PK] === businessObjectId;
            });
            console.assert(matchedBusinessObject, "There is no matched business object.");
            return matchedBusinessObject;

        } else {

        }

    },

    /**@private
     * get  business object  by business object Id under the scope business object
     * @param  {Number} businessObjectId
     * @param  {Object} scopeBusinessObject
     * @return  {Object} BusinessObject
     */
    getBusinessObjectByObjectIdInScopeBusinessObject(businessObjectId, scopeBusinessObject) {
        console.assert(businessObjectId, "businessObjectId is null.");
        console.assert(scopeBusinessObject, "scopeBusinessObject is null.");
        let allBusinessObject = [];
        SchemaDataUtils.getBusinessObjectsCascade(scopeBusinessObject, allBusinessObject);

        if (!_.isEmpty(allBusinessObject)) {
            let matchedBusinessObject = _.find(allBusinessObject, function (businessObject) {
                return businessObject[Constants.COMM_PK] === businessObjectId;
            });
            console.assert(matchedBusinessObject, "There is no matched business object.");
            return matchedBusinessObject;

        }

    },


    /**@private
     * get parent business object by child's model name and object code in the scope business object
     * @param  {String} childModelName
     * @param  {String} childObjectCode
     * @param  {Object} scopeBusinessObject
     * @return  {Object} BusinessObject
     */
    getParentBusinessObjectByChildModelNameAndObjectCode(childModelName, childObjectCode, scopeBusinessObject) {
        console.assert(childModelName, "childModelName is null.");
        console.assert(childObjectCode, "childModelName is null.");
        console.assert(scopeBusinessObject, "scopeBusinessObject is null.");

        const childBusinessObject = SchemaDataUtils.getBusinessObjectByModelNameAndCodeInScopeBusinessObject(childModelName, childObjectCode, scopeBusinessObject);
        console.assert(childBusinessObject, "childBusinessObject is null.");
        const parentBusinessObject = this.getParentBusinessObjectByChildBusinessObject(childBusinessObject, scopeBusinessObject);
        console.assert(parentBusinessObject, "parentBusinessObject is null.");
        return parentBusinessObject;
    }

}


