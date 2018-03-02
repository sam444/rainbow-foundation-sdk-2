import SchemaDataUtils from "./SchemaDataUtils";
import Constants from "../../constants/Constants";



let changeSeq = 0;

module.exports = {

    /**@private
     * get all instance object under root business object.
     * It be used for data table to load all records.
     * @param  {Object} instanceObject
     * @param  {Object} businessObject
     * @param  {Array} resultObjectList
     * @param  {Array} allBusinessObject
     */
    getInstanceObjectsCascade: function (instanceObject, businessObject, resultObjectList, allBusinessObject) {
        'use strict';
        console.assert(instanceObject, "instanceObject is null.");
        console.assert(businessObject, "businessObject is null.");

        let cacheKey = null;
        /*if (instanceObject[Constants.COMM_TYPE] === Constants.POLICY_ROOT_TYPE || instanceObject[Constants.VERSION_FOR_CLIENT]) {
            cacheKey = Constants.InstanceObjectsCascadeArray + Constants.CONNECT_KEY + this.getBusinessUUID(instanceObject) + Constants.CONNECT_KEY + instanceObject[Constants.VERSION_FOR_CLIENT];
            if (DataCache[cacheKey]) {
                resultObjectList = DataCache[cacheKey];
                return;
            }
        }*/

        if (!_.find(resultObjectList, function (resultObject) {
            return this.getBusinessUUID(resultObject) === this.getBusinessUUID(instanceObject);
        }.bind(this))) {
            resultObjectList.push(instanceObject);
        }

        // get all reference keys
        const childReferenceKeys = SchemaDataUtils.getChildrenBusinessObjectKeyByBusinessObject(businessObject);

        // get all instance children 
        if (childReferenceKeys) {
            let allChildrenInstances = [];
            _.each(childReferenceKeys, function (childKey) {
                let childrenWithKey = instanceObject[childKey];
                if (childrenWithKey) {
                    allChildrenInstances.push(childrenWithKey);
                }

            }.bind(this));

            allChildrenInstances = _.flatten(allChildrenInstances);

            if (allChildrenInstances) {
                for (let childInstanceIndex = 0; childInstanceIndex < allChildrenInstances.length; childInstanceIndex++) {
                    let childInstance = allChildrenInstances[childInstanceIndex];
                    console.assert(childInstance, "childInstance is null.");
                    let childBusinessObjectId = childInstance[Constants.DD_BUSINESS_OBJECT_ID];
                    let childBusinessObject = null;
                    if (childBusinessObjectId) {
                        console.assert(childBusinessObjectId, "childBusinessObjectId is null.");
                        childBusinessObject = SchemaDataUtils.getBusinessObjectById(childBusinessObjectId, allBusinessObject);
                        console.assert(childBusinessObject, "childBusinessObject is null.");
                    }else{
                        childBusinessObject = SchemaDataUtils.getBusinessObjectByType(childInstance, allBusinessObject);
                    }

                    this.getInstanceObjectsCascade(childInstance, childBusinessObject, resultObjectList, allBusinessObject);
                }
            }
        }
    },

    /**@private
     * build and set the business UUID for new created domain object by businessObjectId + _ + index
     * @param  {Object} parentInstanceObject
     * @param  {Object} childInstanceObject
     * @param  {Object} childBusinessObject
     * @return  {String} the businessUUID of the childInstanceObject
     */
    buildBusinessUUID(parentInstanceObject, childInstanceObject, childBusinessObject) {
        'use strict';
        console.assert(parentInstanceObject);
        console.assert(childInstanceObject);
        console.assert(childInstanceObject[Constants.DD_BUSINESS_OBJECT_ID]);

        // if there the business UUID already exists
        if (!this.getBusinessUUID(childInstanceObject)) {
            console.assert(childBusinessObject, "The business object can not be found.");
            let existingChildInstance = this.getDirectChildInstanceByBusinessObject(parentInstanceObject, childBusinessObject);
            if (_.isEmpty(existingChildInstance)) {
                childInstanceObject[Constants.COMM_UUID] = childInstanceObject[Constants.DD_BUSINESS_OBJECT_ID] + Math.random() + Constants.COMM_CONNECTOR + Constants.COMM_CONNECTOR + new Date().getTime();
            } else {
                childInstanceObject[Constants.COMM_UUID] = childInstanceObject[Constants.DD_BUSINESS_OBJECT_ID] + Math.random() + Constants.COMM_CONNECTOR + Constants.COMM_CONNECTOR + new Date().getTime();
            }
        }

        return this.getBusinessUUID(childInstanceObject);
    },


    /**@private
     * get the instance array  by businessObject.
     * @param  {Object} parentInstanceObject
     * @param  {Object} childBusinessObject
     * @return  {Array} the children instance domain object.
     */
    getDirectChildInstanceByBusinessObject(parentInstanceObject, businessObject) {
        'use strict';
        const childKey = this.getDirectChildInstanceKeyByBusinessObject(businessObject);
        return parentInstanceObject[childKey];
    },


    /**@private
     * get key of the model in the parent domain object(The name rule is provided by service site.)
     * @param  {Object} businessObject
     * @return  {String} the property name of domain object in the parent domain object.
     */
    getDirectChildInstanceKeyByBusinessObject(businessObject) {
        'use strict';
        console.assert(businessObject !== null, "businessObject is null.");
        const key = businessObject[Constants.RELATION_NAME];
        console.assert(key !== null, "key is null.");
        return key;
    },

    /**@private
     * get the PK if there has one,or return the business UUID
     * @param  {Object} objectInstance
     * @return  {String} the business UUID
     */
    getBusinessUUID(objectInstance) {
        'use strict';
        if (objectInstance) {
            const pk = objectInstance[Constants.COMM_PK];
            if (pk) {
                return pk;
            }
            let businessUUD = objectInstance[Constants.COMM_UUID];

            if (!businessUUD) {
                businessUUD = objectInstance[Constants.DD_BUSINESS_OBJECT_ID] + Constants.COMM_CONNECTOR + Math.random() + Constants.COMM_CONNECTOR + new Date().getTime();
                objectInstance[Constants.COMM_UUID] = businessUUD;
                return businessUUD;
            }

            return businessUUD;
        }
    },

    /**@private
     * get instance object by business object under the scope object which there is only one matched.
     * @param  {Object} businessObject
     * @param  {Object} scopeObject
     * @param  {Object} scopeBusinessObject
     * @param  {Array} allBusinessObject
     * @return  {Object} the matched instance object.
     */
    getDomainObjectByBusinessObjectInScopeDomainObject(businessObject, scopeObject, scopeBusinessObject, allBusinessObject) {
        'use strict';
        console.assert(businessObject !== null, "businessObject is null.");
        console.assert(scopeObject !== null, "scopeObject is null.");
        console.assert(scopeBusinessObject !== null, "scopeBusinessObject is null.");

        const matchedDomainInstances = this.getAllDomainObjectByBusinessObjectInScopeDomainObject(
            businessObject, scopeObject, scopeBusinessObject, allBusinessObject);
        console.assert(_.size(matchedDomainInstances) < 2, "There are more than one instance object.");
        if (!_.isEmpty(matchedDomainInstances)) {
            return matchedDomainInstances[0];
        } else {
            return null;
        }

    },


    /**@private
     * get all instance object by business object under the scope object.
     * @param  {Object} businessObject
     * @param  {Object} scopeObject
     * @param  {Object} scopeBusinessObject
     * @param  {Array} allBusinessObject
     * @return  {Array} the matched instance objects.
     */
    getAllDomainObjectByBusinessObjectInScopeDomainObject(businessObject, scopeObject, scopeBusinessObject, allBusinessObject) {
        'use strict';
        console.assert(businessObject !== null, "businessObject is null. ");
        console.assert(scopeObject !== null, "scopeObject is null.");
        console.assert(scopeBusinessObject !== null, "scopeBusinessObject is null.");
        let allDomainObject = [];

        this.getInstanceObjectsCascade(scopeObject, scopeBusinessObject, allDomainObject, allBusinessObject, businessObject);

        if (!_.isEmpty(allDomainObject)) {
            let matchedDomainInstances = _.filter(allDomainObject, function (domainObject) {
                return domainObject[Constants.DD_BUSINESS_OBJECT_ID] === businessObject[Constants.COMM_PK];
            });

            return matchedDomainInstances;
        }
    },

    /**@private
     * create a new instance domain object by business object.
     * @param  {Object} parentDomainObject
     * @param  {Object} businessObject
     * @return  {Object} the created instance objects.
     */
    createNewDomainObjectByBusinessObject(parentDomainObject, businessObject, allBusinessObject) {
        'use strict';
        let domainObject = {};
        domainObject[Constants.DD_BUSINESS_OBJECT_ID] = businessObject[Constants.COMM_PK];
        domainObject[Constants.COMM_TYPE] = businessObject[Constants.DD_MODEL_NAME] + Constants.COMM_TYPE_CONNECTOR + businessObject[Constants.DD_OBJECT_CODE];
        this.buildBusinessUUID(parentDomainObject, domainObject, businessObject);
        let tempData = {};
        tempData[Constants.AUTO_CREATED] = Constants.YES_FLG;
        domainObject["TempData"] = tempData;
        this.setDefaultValueForNewDomainObjectByBusinessObject(domainObject, businessObject);
        if (businessObject[Constants.CHILD_ELEMENTS]) {
            this.autoCreateChildDomainObject(domainObject, businessObject, allBusinessObject);
        }
        return domainObject;
    },

    /**@private
     * set default value of binding field to new business object
     * @param  {Object} domainObject
     * @param  {Object} businessObject
     */
    setDefaultValueForNewDomainObjectByBusinessObject(domainObject, businessObject) {
        'use strict';
        console.assert(domainObject, "domainObject is null.");
        console.assert(businessObject, "businessObject is null.");
        const fields = businessObject[Constants.FIELDS];
        if (fields) {
            const keys = Object.keys(fields);
            _.each(keys, function (key) {
                let field = fields[key];
                const defaultValue = field[Constants.DEFAULT_VALUE];
                if (defaultValue) {
                    domainObject[key] = defaultValue;
                }
            }.bind(this));
        }
    },

    /**@private
     * auto create child domain object by business object definition
     * @param  {Object} parentDomainInstance
     * @param  {Object} parentBusinessObject
     * @param  {Array} allBusinessObject
     */
    autoCreateChildDomainObject(parentDomainInstance, parentBusinessObject, allBusinessObject) {
        'use strict';
        // get all child business object it the childElements property
        const childElementObjects = parentBusinessObject[Constants.CHILD_ELEMENTS];
        if (!_.isEmpty(childElementObjects)) {
            const keys = Object.keys(childElementObjects);
            if (keys) {
                for (let index = 0; index < _.size(keys); index++) {
                    let key = keys[index];
                    let childElementList = childElementObjects[key];
                    if (childElementList) {
                        for (let childIndex = 0; childIndex < _.size(childElementList); childIndex++) {
                            let childSchemaObject = childElementList[childIndex];
                            if (childSchemaObject[Constants.AUTO_CREATED] !== Constants.YES_FLG) {
                                continue;
                            }

                            let domainChildInstance = this.getDomainObjectByBusinessObjectInScopeDomainObject(childSchemaObject, parentDomainInstance, parentBusinessObject, allBusinessObject);
                            if (domainChildInstance) {
                                continue;
                            } else {
                                // auto create child
                                domainChildInstance = this.createNewDomainChildInstanceAndAttachToParent(parentDomainInstance, childSchemaObject, allBusinessObject);
                            }
                        }
                    }
                }

            }
        }
        return;
    },

    /**@private
     * attach the child instance object to the parent domain object.
     * @param  {Object} parentDomainInstance
     * @param  {Object} childDomainInstance
     * @param  {Object} childBusinessObject
     */
    attachChildToParent(parentDomainInstance, childDomainInstance, childBusinessObject) {
        'use strict';
        let childInstances = this.getDirectChildInstanceByBusinessObject(parentDomainInstance, childBusinessObject);

        if (_.isEmpty(childInstances)) {
            const childKey = this.getDirectChildInstanceKeyByBusinessObject(childBusinessObject);
            const relationType = childBusinessObject[Constants.RELATION_TYPE];
            if (relationType === Constants.RELATION_TYPE_ONE) {
                let childModelInstanceList = [];
                childModelInstanceList.push(childDomainInstance);
                parentDomainInstance[childKey] = childModelInstanceList;
            } else {
                parentDomainInstance[childKey] = childDomainInstance;
            }
        } else {

            childInstances.push(childDomainInstance);
        }
    },

    /**@private
     * attach the child instance object to the parent domain object.
     * @param  {Object} parentDomainInstance
     * @param  {Object} childDomainInstance
     * @param  {Object} childBusinessObject
     */
    attachChildrenToParent(parentDomainInstance, childDomainInstanceArray, childBusinessObject) {
        'use strict';
        if (!_.isEmpty(childDomainInstanceArray)) {
            for (let index = 0; index < childDomainInstanceArray.length; index++) {
                this.attachChildToParent(parentDomainInstance, childDomainInstanceArray[index], childBusinessObject);
            }
        }
    },

    /**@private
     * create a new  child instance object and attach to  the parent domain object.
     * @param  {Object} parentDomainInstance
     * @param  {Object} childBusinessObject
     * @return  {Object} childDomainInstanceObject
     */
    createNewDomainChildInstanceAndAttachToParent(parentDomainObject, businessObject, allBusinnessObject) {
        'use strict';
        const childDomainInstance = this.createNewDomainObjectByBusinessObject(parentDomainObject, businessObject, allBusinnessObject);
        console.assert(childDomainInstance !== null, "childDomainInstance is null.");
        this.attachChildToParent(parentDomainObject, childDomainInstance, businessObject);
        return childDomainInstance;
    },

    /**@private
     * clean the logic delete data recursively
     * @param  {Object} domainInstance
     * @param  {Object} businessObject
     */
    cleanDomainInstanceByFlag(domainInstance, businessObject, allBusinnessObject) {
        'use strict';
        console.assert(allBusinnessObject, "all business Object is null.");
        console.assert(businessObject[Constants.COMM_PK] === domainInstance[Constants.DD_BUSINESS_OBJECT_ID], "childDomainInstance's business object id  is not equal with schema business object.");
        this.deleteFlag(domainInstance);

        if (domainInstance && domainInstance.TempData) {
            delete domainInstance.TempData[Constants.AUTO_CREATED];
        }

        const childElementObjects = businessObject[Constants.CHILD_ELEMENTS];

        if (_.isEmpty(childElementObjects)) {
            return;
        } else {
            const keys = Object.keys(childElementObjects);
            if (keys) {
                for (let index = 0; index < _.size(keys); index++) {
                    let key = keys[index];
                    let childElementList = childElementObjects[key];
                    if (childElementList) {
                        for (let childIndex = 0; childIndex < _.size(childElementList); childIndex++) {
                            let childSchemaObject = childElementList[childIndex];
                            let childKey = this.getDirectChildInstanceKeyByBusinessObject(childSchemaObject);
                            let childInstances = domainInstance[childKey];
                            if (!childInstances) {
                                continue;
                            }
                            if (!_.isArray(childInstances)) {
                                if (childInstances[Constants.CLEAN_FROM_CLIENT] === Constants.YES_FLG) {
                                    delete domainInstance[childKey];
                                } else {
                                    delete childInstances[Constants.CLEAN_FROM_CLIENT];
                                    // check the grandchild
                                    this.cleanDomainInstanceByFlag(childInstances, childSchemaObject, allBusinnessObject);
                                }
                            } else {
                                for (let childIndex = 0; childIndex < childInstances.length; childIndex++) {
                                    let childInstance = childInstances[childIndex];
                                    if (childInstance[Constants.CLEAN_FROM_CLIENT] === Constants.YES_FLG) {
                                        childInstances.splice(childIndex, 1);
                                        childIndex--;
                                    } else {
                                        delete childInstance[Constants.CLEAN_FROM_CLIENT];
                                        // check the grandchild
                                        childSchemaObject = SchemaDataUtils.getBusinessObjectById(childInstance[Constants.DD_BUSINESS_OBJECT_ID], allBusinnessObject);
                                        if(childSchemaObject){
                                            this.cleanDomainInstanceByFlag(childInstance, childSchemaObject, allBusinnessObject);
                                        }else{
                                            this.deleteFlag(childInstance);
                                        }
                                    }
                                }

                            }

                        }
                    }
                }

            }
        }
    },

    deleteFlag(domainInstance){
        delete domainInstance[Constants.CLEAN_FROM_CLIENT];
        delete domainInstance[Constants.IS_DIRTY_FLG];
        delete domainInstance[Constants.DIRTY_OBJECT];
        delete domainInstance[Constants.VERSION_FOR_CLIENT];
        delete domainInstance[Constants.DATA_INDEX];
    },

	clearDirtyData(endorsement){
        'use strict';
        this.deleteFlag(endorsement);
        if (endorsement.Policy) {
            this.deleteFlag(endorsement.Policy);
        }
    },
    
    /**@private
     * generate new version for domain object by closure
     * @param  {Object} domainObject
     */
    changeVersionByClosure(domainObject) {
        return function () {
            changeSeq++;
            //domainObject[Constants.VERSION_FOR_CLIENT] = new Date().getTime() + "" + changeSeq;
        }

    },

    /**@private
     * @private
     * generate new version for domain object
     * @param  {Object} domainObject
     */
    changeVersion(domainObject) {
        this.changeVersionByClosure(domainObject)();

    }


};
