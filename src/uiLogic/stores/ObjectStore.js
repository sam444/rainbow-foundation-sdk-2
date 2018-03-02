import ObjectSchemaStore from "./ObjectSchemaStore";
import Constants from "../../constants/Constants";
import DataUtils from "../utils/DataUtils";
import SchemaDataUtils from "../utils/SchemaDataUtils";
import ClassCreater from '../utils/ClassCreater';
import { SessionContext } from 'rainbow-foundation-cache';
module.exports = {

    /**@private
     * delete domain object in the scope object of client model object.The new state will be flush to the modelObject store.
	 * @param  {Object} domainObject
	 * @param  {Object} scopeObject
	 * @param  {Object} modelObject
     */
    deleteDomainObject(domainObject, scopeObject, modelObject) {
        const parentDomainObject = this.getParentDomainObjectByChildDomainObject(domainObject, scopeObject);
        const targetBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(domainObject[Constants.DD_BUSINESS_OBJECT_ID]);
        let childDomainObjects = DataUtils.getDirectChildInstanceByBusinessObject(parentDomainObject, targetBusinessObject);
        console.assert(childDomainObjects, "There is no matched child.");

        // one to many case
        if (_.isArray(childDomainObjects)) {
            const matchedChild = childDomainObjects.find(function (child) {
                return DataUtils.getBusinessUUID(domainObject) === DataUtils.getBusinessUUID(child);
            });

            console.assert(matchedChild, "There is no matched child.");
            const index = _.indexOf(childDomainObjects, matchedChild);
            childDomainObjects.splice(index, 1);

        } else {
            // one to one case
            const childKey = DataUtils.getDirectChildInstanceKeyByBusinessObject(targetBusinessObject);
            delete parentDomainObject[childKey];
        }
        // if modelObject is not null then refresh to modelObject store
        if (modelObject) {
            this.setModelObject(modelObject);
        } else {
            DataUtils.changeVersion(scopeObject);
        }
    },

    /**@private
     * create a new one and attach to the parent.The new state will be flush to the  store.
     * It be used for inline editor case.
     * if the parent does not exists yet,it will be generated automatically.
	 * @param  {String} modelName
	 * @param  {String} objectCode
	 * @param  {Object} scopeObject
	 * @param  {Object} modelObject
     * @return {Object} createdChild
     */
    addDomainObjectInstantly(modelName, objectCode, scopeObject, modelObject) {
        const scopeBusinessObjectId = scopeObject[Constants.DD_BUSINESS_OBJECT_ID];
        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeBusinessObjectId);
        const targetBusinessObject = SchemaDataUtils.getBusinessObjectByModelNameAndCodeInScopeBusinessObject(modelName, objectCode, scopeBusinessObject);
        const createdChild = this.createNewInstanceByBusinessObjectAndAttachToParent(targetBusinessObject, scopeObject, scopeBusinessObject, modelObject);
        if (modelObject) {
            DataUtils.changeVersion(modelObject);
            this.setModelObject(modelObject);
        } else {
            DataUtils.changeVersion(scopeObject);
        }
        return createdChild;
    },


    /**@private
     * @private
     * update the domain object in the store and attach it to parent if still not be attached.
     * It be used for popup window to save data  case.
	 * @param  {Object} domainObject
	 * @param  {Object} scopeObject
	 * @param  {Object} modelObject
     */
    saveDomainObject(domainObject, scopeObject, modelObject) {
        const businessObjectId = domainObject[Constants.DD_BUSINESS_OBJECT_ID];
        console.assert(businessObjectId, "businessObjectId is null.");
        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeObject[Constants.DD_BUSINESS_OBJECT_ID]);
        const childBusinessObject = SchemaDataUtils.getBusinessObjectByBusinessObjectIdInScopeBusinessObject(businessObjectId, scopeBusinessObject);
        const modelName = childBusinessObject[Constants.DD_MODEL_NAME];
        const objectCode = childBusinessObject[Constants.DD_OBJECT_CODE];

        const parentDomainObject = this.getParentDomainObjectByModelNameAndObjectCode(modelName, objectCode, scopeObject);
        console.assert(parentDomainObject, "parentDomainObject is null.");

        const childInstanceArray = DataUtils.getDirectChildInstanceByBusinessObject(parentDomainObject, childBusinessObject);
        delete domainObject[Constants.COMM_AUTO_CREATED];
        if (_.isEmpty(childInstanceArray)) {
            DataUtils.attachChildToParent(parentDomainObject, domainObject, childBusinessObject);
        } else {
            // one to many case
            if (_.isArray(childInstanceArray)) {
                const matchedChild = _.find(childInstanceArray, function (child) {
                    return yDataUtils.getBusinessUUID(child) === DataUtils.getBusinessUUID(domainObject);
                });

                if (matchedChild) {
                    const index = _.indexOf(childInstanceArray, matchedChild);
                    childInstanceArray[index] = domainObject;
                } else {
                    childInstanceArray.push(domainObject);
                }
            } else {
                // one to one case
                const childKey = DataUtils.getDirectChildInstanceKeyByBusinessObject(childBusinessObject);
                parentDomainObject[childKey] = domainObject;
            }

        }

        // if modelObject is not null then refresh to modelObject store
        if (modelObject) {
            this.setModelObject(modelObject);
        } else {
            DataUtils.changeVersion(scopeObject);
        }

    },

    /**@private
     * refresh the modelObject data to store,which includes schema data.
     * @param  {Object} payload - {Object:modelObject}
     */
    refreshModelObjectDataWithSchema(payload) {
        this.setModelObject(payload.modelObject);
        DataUtils.changeVersion(this.getModelObject());
    },

    /**@private
     * refresh modelObject data from action's return value.
     * @param  {Object} modelObject
    */
    refreshModelObjectData(modelObject) {
        const model = modelObject["Model"];
        const status = modelObject["Status"];
        if ("OK" == status && model) {
            this.modelObject = modelObject;
        } else {
            this.modelObject = { "Model": modelObject, "Status": "OK" }
        }

        delete this.modelObject["Model"][Constants.IS_DIRTY_FLG];
        delete this.modelObject["Model"][Constants.DIRTY_OBJECT];
        return this.modelObject;
    },

    /**@private
      generate new version for domain object
      @param  {Object} domainObject
    */
    changeVersion(domainObject) {
        DataUtils.changeVersion(domainObject);
    },

    /**@private
     * get all domain object which matched the condition.
     * It be used for data table to load all records.
     * @param  {String} modelName
     * @param  {String} objectCodes
     * @param  {Object} parentObject
     * @param  {Object} scopeObject
     * @return {Array} all matched domain objects.
     */
    getAllDomainObjectByModelNameAndObjectCodeUnderParentObjectInScopeObject(modelName, objectCodes, parentObject, scopeObject) {
        console.assert(modelName, "modelName is null.");
        // the scope object is the default parent.
        if (!scopeObject) {
            scopeObject = parentObject;
        }
        let objectCodeArray = [];
        if (objectCodes) {
            objectCodeArray = objectCodes.split(',');
        }


        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(
            scopeObject[Constants.DD_BUSINESS_OBJECT_ID]);

        console.debug("scopeBusinessObject:", scopeBusinessObject);

        const parentBusinessObject = SchemaDataUtils.getBusinessObjectByBusinessObjectIdInScopeBusinessObject(
            parentObject[Constants.DD_BUSINESS_OBJECT_ID], scopeBusinessObject);

        console.assert(parentBusinessObject, "parentBusinessObject is null.");

        // valid the parent domain instance is under the scope object
        let matchedParentDomainObject = null;
        if (parentObject) {
            matchedParentDomainObject = parentObject;
        } else {
            matchedParentDomainObject = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(
                parentBusinessObject, scopeObject, scopeBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
        }

        console.assert(matchedParentDomainObject, "matchedParentDomainObject is null.");
        console.assert(DataUtils.getBusinessUUID(matchedParentDomainObject) === DataUtils.getBusinessUUID(parentObject),
            "The parent object is not matched with the parent domain object in the store.");
        const allMatchedBusinessObjects = SchemaDataUtils.getAllBusinessObjectByModelNameAndCodesInScopeBusinessObject(
            modelName, objectCodeArray, parentBusinessObject);
        let allMatchedDomainObjects = [];
        if (_.isEmpty(allMatchedBusinessObjects)) {
            return [];
        } else {
            _.forEach(allMatchedBusinessObjects, function (matchedBusinessObject) {
                let matchedDomainObjects = DataUtils.getAllDomainObjectByBusinessObjectInScopeDomainObject(
                    matchedBusinessObject, matchedParentDomainObject, parentBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
                if (!_.isEmpty(matchedDomainObjects)) {
                    _.forEach(matchedDomainObjects, function (matchedDomainObject) {
                        allMatchedDomainObjects.push(matchedDomainObject);
                    });
                }
            });
        }
        return allMatchedDomainObjects;
    },


    /**@private
     * get a domain object if existing,or create a new one
     * It be used for one to one domain object for the first time render
     * @param  {String} modelName
     * @param  {String} objectCodes
     * @param  {Object} scopeObject
     * @param  {Object} modelObject
     * @return {Object} the matched domain object or the created new one.
     */
    getDomainObjectByModelAndCodeAlways(modelName, objectCode, scopeObject, modelObject) {
        console.assert(modelName !== null, "modelName is null");
        console.assert(objectCode !== null, "objectCode is null");
        const scopeBusinessObjectId = scopeObject[Constants.DD_BUSINESS_OBJECT_ID];
        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeBusinessObjectId);
        const targetBusinessObject = SchemaDataUtils.getBusinessObjectByModelNameAndCodeInScopeBusinessObject(modelName, objectCode, scopeBusinessObject);
        const matchedDomainInstance = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(targetBusinessObject, scopeObject, scopeBusinessObject, ObjectSchemaStore.getAllSchemaObjects());

        if (matchedDomainInstance) {
            return matchedDomainInstance;
        } else {
            return this.createNewInstanceByBusinessObjectAndAttachToParent(targetBusinessObject, scopeObject, scopeBusinessObject, modelObject);
        }

    },

    /**@private
     * get a domain object if existing,or create a new one for client case
     * when creating a new one,the modelObject will be marked as dirty.
     * @param  {String} modelName
     * @param  {String} objectCodes
     * @param  {Object} modelObject
     * @param  {String} scopeModelName
     * @param  {String} scopeObjectCode
     * @param  {Object} parentObject
     * @return {Object} the matched domain object or the created new one.
     */
    getDomainObjectByModelAndCodeAlwaysInComponentState(modelName, objectCode,
        modelObject,
        scopeModelName, scopeObjectCode, parentObject) {
        console.assert(modelName !== null, "modelName is null");
        console.assert(objectCode !== null, "objectCode is null");
        console.assert(modelObject !== null, "componentRootInstance is null");
        let scopeObject;
        if (scopeModelName && scopeObjectCode) {
            scopeObject = this.locateScopeObjectInComponentObject(scopeModelName, scopeObjectCode, modelObject);
        } else {
            scopeObject = modelObject;
        }
        console.assert(scopeObject !== null, "scopeObject is null");

        if (!parentObject) {
            const scopeBusinessObjectId = scopeObject[Constants.DD_BUSINESS_OBJECT_ID];
            const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeBusinessObjectId);
            const targetBusinessObject = SchemaDataUtils.getBusinessObjectByModelNameAndCodeInScopeBusinessObject(modelName, objectCode, scopeBusinessObject);
            const matchedDomainInstance = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(targetBusinessObject, scopeObject, scopeBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
            if (matchedDomainInstance) {
                return matchedDomainInstance;
            } else {
                let createdInstance = this.createNewInstanceByBusinessObjectAndAttachToParent(targetBusinessObject, scopeObject, scopeBusinessObject, modelObject);
                //             DataUtils.changeVersion(modelObject);
                // modelObject[Constants.IS_DIRTY_FLG] = true;
                //             if (modelObject[Constants.DIRTY_OBJECT]) {
                // 	modelObject[Constants.DIRTY_OBJECT].push(createdInstance);
                //             } else {
                // 	modelObject[Constants.DIRTY_OBJECT] = [createdInstance];
                //             }

                return createdInstance;
            }
        } else {
            let allMatchedDomainObjects = this.getAllDomainObjectByModelNameAndObjectCodeUnderParentObjectInScopeObject(modelName, objectCode, parentObject, scopeObject);
            if (!_.isEmpty(allMatchedDomainObjects)) {
                if (_.size(allMatchedDomainObjects) === 1) {
                    return allMatchedDomainObjects[0];
                } else {
                    console.assert(1 === 0, "There are more than one object matched.");
                }
            } else {
                return this.createNewInstanceByModelNameAndObjectAndAttachToParent(modelName, objectCode, parentObject, scopeObject, modelObject);
            }

        }


    },

    /**@private
     * create a new instance domain object and attach to parent domain object
     * @param  {String} modelName
     * @param  {String} objectCodes
     * @param  {Object} parentDomainObject
     * @param  {Object} scopeObject
     * @param  {Object} modelObject
     * @return {Object}  the created new one.
     */
    createNewInstanceByModelNameAndObjectAndAttachToParent(modelName, objectCode, parentObject, scopeObject, modelObject) {

        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeObject[Constants.DD_BUSINESS_OBJECT_ID]);
        console.assert(scopeBusinessObject, "scopeBusinessObject is null.");
        const parentBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(parentObject[Constants.DD_BUSINESS_OBJECT_ID]);
        console.assert(parentBusinessObject, "parentBusinessObject is null.");

        const objectCodes = [objectCode];
        const matchedBusinessObjects = SchemaDataUtils.getAllBusinessObjectByModelNameAndCodesInScopeBusinessObject(modelName, objectCodes, scopeBusinessObject);
        console.assert(matchedBusinessObjects.length === 1, "There is no matched child business object or more than one.");

        const childBusinessObject = matchedBusinessObjects[0];

        const childDomainInstance = DataUtils.createNewDomainChildInstanceAndAttachToParent(parentObject, childBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
        if (modelObject) {
            DataUtils.changeVersion(modelObject);
        } else {
            DataUtils.changeVersion(scopeObject);
        }

        console.assert(childDomainInstance, "childDomainInstance is null.");

        return childDomainInstance;
    },


    /**@private
     * create a new instance domain object by business object  and attach to parent domain object
     * @param  {Object} businessObject
     * @param  {Object} scopeObject
     * @param  {Object} scopeBusinessObject
     * @param  {Object} modelObject
     * @return {Object}  the created new one.
     */
    createNewInstanceByBusinessObjectAndAttachToParent(businessObject, scopeObject, scopeBusinessObject, modelObject) {
        const parentBusinessObject = ObjectSchemaStore.getParentBusinessObjectByChildBusinessObject(businessObject, scopeBusinessObject);


        const matchedParentDomainInstance = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(
            parentBusinessObject, scopeObject, scopeBusinessObject, ObjectSchemaStore.getAllSchemaObjects());

        let childDomainInstance = null;
        if (matchedParentDomainInstance) {


            childDomainInstance = DataUtils.createNewDomainObjectByBusinessObject(matchedParentDomainInstance, businessObject, ObjectSchemaStore.getAllSchemaObjects());

            if (modelObject) {
                DataUtils.changeVersion(modelObject);
            } else {
                DataUtils.changeVersion(scopeObject);
            }

            DataUtils.attachChildToParent(matchedParentDomainInstance, childDomainInstance, businessObject);
            return childDomainInstance;

        } else {
            let createdParentDomainInstance = null;
            do {
                createdParentDomainInstance = this.createNewInstanceByBusinessObjectAndAttachToParent(parentBusinessObject, scopeObject, scopeBusinessObject, modelObject);
            } while (createdParentDomainInstance[Constants.DD_BUSINESS_OBJECT_ID] !== parentBusinessObject[Constants.COMM_PK]);

            DataUtils.changeVersion(modelObject);
            // double check for auto-created case
            childDomainInstance = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(businessObject, scopeObject, scopeBusinessObject, ObjectSchemaStore.getAllSchemaObjects());

            if (!childDomainInstance) {
                childDomainInstance = DataUtils.createNewDomainObjectByBusinessObject(createdParentDomainInstance, businessObject, ObjectSchemaStore.getAllSchemaObjects());
                DataUtils.attachChildToParent(createdParentDomainInstance, childDomainInstance, businessObject);
            }
            return childDomainInstance;
        }
    },

    /**@private
     * @private
     * getAllObjects() : Array
     * create all domain instance object array
     */
    getAllObjects() {
        if (!_.isEmpty(this.allObjects)) {
            return this.allObjects;
        } else {
            this.allObjects = [];
        }

        const modelBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(this.getModelObject()[Constants.DD_BUSINESS_OBJECT_ID]);
        DataUtils.getInstanceObjectsCascade(this.getModelObject(), modelBusinessObject, this.allObjects, ObjectSchemaStore.getAllSchemaObjects());
        return this.allObjects;
    },

    /**@private
     * get modelObject from state
     * @return {Object}  modelObject in the store's state.
     */
    getModelObject() {
        if (this.modelObject) {
            return this.modelObject;
        } else {
            return null;
        }
    },

    setModelObject(modelObject) {
      this.refreshModelObjectData(modelObject);
    },


    /**@private
     * update the field value of the domain object.
     * @param  {Object} domainObject
     * @param  {String} fieldName
     * @param  {Object} fieldValue
     * @param  {Object} scopeObject
     */
    updateFieldValueOfDomainObject(domainObject, fieldName, fieldValue, scopeObject) {
        console.assert(domainObject, "domainObject is null.");

        const businessObjectId = domainObject[Constants.DD_BUSINESS_OBJECT_ID];
        console.assert(businessObjectId, "businessObjectId is null.");
        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeObject[Constants.DD_BUSINESS_OBJECT_ID]);
        const childBusinessObject = SchemaDataUtils.getBusinessObjectByBusinessObjectIdInScopeBusinessObject(businessObjectId, scopeBusinessObject);
        const modelName = childBusinessObject[Constants.DD_MODEL_NAME];
        const objectCode = childBusinessObject[Constants.DD_OBJECT_CODE];
        const parentDomainObject = this.getParentDomainObjectByModelNameAndObjectCode(modelName, objectCode, scopeObject);
        console.assert(parentDomainObject, "parentDomainObject is null.");
        const childInstanceArray = DataUtils.getDirectChildInstanceByBusinessObject(parentDomainObject, childBusinessObject);
        console.assert(_.size(childInstanceArray) > 0, "There are no children in the parent domain object.");
        const matchedChild = _.find(childInstanceArray, function (child) {
            return DataUtils.getBusinessUUID(child) === DataUtils.getBusinessUUID(domainObject);
        });

        console.assert(matchedChild, "There are no matched child in the parent domain object.");
        matchedChild[fieldName] = fieldValue;
        return matchedChild;
    },

    /**@private
     * clone a new domain object for edit function.
     * @param  {Object} domainObject
     * @param  {Object} scopeObject
     * @return {Object} cloned domainObject.
     */
    editDomainObject(domainObject) {
        console.assert(domainObject, "domainObject is null.");
        const jsonObject = JSON.stringify(domainObject);
        return JSON.parse(jsonObject);
    },

    /**@private
     * create a new domain object without attached to parent domain object.
     * @param  {String} modelName
     * @param  {String} objectCode
     * @param  {Object} scopeObject
     * @return {Object} the created new one.
     */
    createNewDomainObject(modelName, objectCode, scopeObject) {

        const parentDomainObject = this.getParentDomainObjectByModelNameAndObjectCode(modelName, objectCode, scopeObject);
        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeObject[Constants.DD_BUSINESS_OBJECT_ID]);
        const childBusinessObject = SchemaDataUtils.getBusinessObjectByModelNameAndCodeInScopeBusinessObject(modelName, objectCode, scopeBusinessObject);
        const parentBusinessObject = ObjectSchemaStore.getParentBusinessObjectByChildBusinessObject(childBusinessObject, scopeBusinessObject);

        if (!parentDomainObject) {
            throw new Error("There is no parent domain object exists.");
        }

        if (scopeBusinessObject[Constants.COMM_PK] !== parentBusinessObject[Constants.COMM_PK]) {
            throw new Error("In the current case, the scope object must be the parent object.");
        }
        return DataUtils.createNewDomainObjectByBusinessObject(parentDomainObject, childBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
    },

    /**@private
     * @private
     * get parent domain object of child domain object in the scope domain object
     * @param  {Object} childDomainObject
     * @param  {Object} scopeObject
     * @return {Object} the parent domain object of the childDomainObject.
     */
    getParentDomainObjectByChildDomainObject(childDomainObject, scopeObject) {

        const scopeBusinessObjectId = scopeObject[Constants.DD_BUSINESS_OBJECT_ID];
        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeBusinessObjectId);
        console.assert(scopeBusinessObject, "scopeBusinessObject is null.");
        const childBusinessObjectId = childDomainObject[Constants.DD_BUSINESS_OBJECT_ID];
        const childBusinessObject = SchemaDataUtils.getBusinessObjectByBusinessObjectIdInScopeBusinessObject(childBusinessObjectId, scopeBusinessObject);
        console.assert(childBusinessObject, "childBusinessObject is null.");
        const parentBusinessObject = ObjectSchemaStore.getParentBusinessObjectByChildBusinessObject(childBusinessObject, scopeBusinessObject);
        console.assert(parentBusinessObject, "parentBusinessObject is null.");
        const parentDomainObject = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(parentBusinessObject, scopeObject, scopeBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
        console.assert(parentDomainObject, "parentDomainObject is null.");
        return parentDomainObject;
    },

    /**@private
     * @private
     * get parent domain object of By child's model name and object code in the scope domain object
     * @param  {String} modelName
     * @param  {String} objectCode
     * @param  {Object} scopeObject
     * @return {Object} the parent domain object of the matched childDomainObject.
     */
    getParentDomainObjectByModelNameAndObjectCode(modelName, objectCode, scopeObject) {
        console.assert(modelName, "modelName is null.");
        console.assert(objectCode, "objectCode is null.");

        const scopeBusinessObjectId = scopeObject[Constants.DD_BUSINESS_OBJECT_ID];
        const scopeBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(scopeBusinessObjectId);
        const parentBusinessObject = ObjectSchemaStore.getParentBusinessObjectByChildModelNameAndObjectCode(modelName, objectCode, scopeBusinessObject);
        const parentDomainObject = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(parentBusinessObject, scopeObject, scopeBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
        return parentDomainObject;
    },

    /**@private
     * @private
     * get scope domain object in the modelObject.
     * @param  {String} scopeModelName
     * @param  {String} scopeObjectCode
     * @param  {Object} componentObject
     * @return {Object} the matched scope domain object.
     */
    locateScopeObjectInComponentObject(scopeModelName, scopeObjectCode, componentObject) {
        console.assert(scopeModelName, "scopeObjectCode is null.");
        console.assert(scopeObjectCode, "scopeObjectCode is null.");
        const objectBusinessObjectId = componentObject[Constants.DD_BUSINESS_OBJECT_ID];
        const objectBusinessObject = ObjectSchemaStore.getBusinessObjectByObjectId(objectBusinessObjectId);
        const targetBusinessObject = SchemaDataUtils.getBusinessObjectByModelNameAndCodeInScopeBusinessObject(scopeModelName, scopeObjectCode, objectBusinessObject);
        console.assert(targetBusinessObject, "targetBusinessObject is null.");
        const matchedScopeInstance = DataUtils.getDomainObjectByBusinessObjectInScopeDomainObject(targetBusinessObject, componentObject, objectBusinessObject, ObjectSchemaStore.getAllSchemaObjects());
        console.assert(matchedScopeInstance, "matchedScopeInstance is null.");
        return matchedScopeInstance;
    }

}

