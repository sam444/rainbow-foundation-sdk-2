import Constants from '../constants/Constants';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import { SessionContext } from 'rainbow-foundation-cache';
import SchemaUtil from "../schema/SchemaUtil";
import { ObjectUtil } from "rainbow-foundation-tools";
import jiff from "jiff";

module.exports = {

    getUUId() {
        return _.uniqueId(new Date().getTime());
    },

    initModelObject(schemas) {
        const modelObject = new Object();
        modelObject[Constants.DD_BUSINESS_OBJECT_ID] = schemas[Constants.COMM_PK];
        modelObject[Constants.COMM_TYPE] = schemas[Constants.COMM_TYPE];
        if (schemas[Constants.DD_MODEL_NAME] != Constants.POLICY_FORM) {
            switch (schemas[Constants.DD_MODEL_NAME]) {
                case Constants.POLICY:
                    modelObject[Constants.PRODUCT_ID] = schemas[Constants.ELEMENT_ID];
                    break;
                case Constants.POLICY_LOB:
                    modelObject[Constants.PRODUCT_LOB_ID] = schemas[Constants.ELEMENT_ID];
                    break;
                default:
                    modelObject[Constants.PRODUCT_ELEMENT_ID] = schemas[Constants.ELEMENT_ID];
                    break;
            }
        }
        modelObject[Constants.TEMP_DATA] = { "uuid": this.getUUId() };
        return modelObject;
    },

    setModelObjectUUID(rootObject) {
        if (rootObject[Constants.TEMP_DATA]) {
            rootObject[Constants.TEMP_DATA][Constants.UU_ID] = this.getUUId();
        } else {
            rootObject[Constants.TEMP_DATA] = { "uuid": this.getUUId() };
        }
        _.each(_.keys(rootObject), (key) => {
            if (_.isArray(rootObject[key])) {
                _.each(rootObject[key], (item) => {
                    if (_.isObject(item) && item[Constants.COMM_TYPE]) {
                        this.setModelObjectUUID(item);
                    }
                });
            } else if (_.isObject(rootObject[key]) && rootObject[key][Constants.COMM_TYPE]) {
                this.setModelObjectUUID(rootObject[key]);
            }
        });
    },

    setModelObject(param, child, rootObject, rootSchema) {
        const schemas = SchemaUtil.lookupModelObjectSchema(param, rootSchema);
        console.assert(schemas, `${JSON.stringify(param)} lookup schema is null`);
        const currentSchema = schemas[Constants.CURRENT_SCHEMA];
        const parentSchema = schemas[Constants.PARENT_SCHEMA];

        if (parentSchema) {
            const parentParam = {
                'ModelName': parentSchema[Constants.DD_MODEL_NAME],
                'ObjectCode': parentSchema[Constants.DD_OBJECT_CODE],
                'ProductId': param[Constants.PRODUCT_ID],
                'uuid': param[Constants.UU_ID]
            };
            const grandFatherSchemas = SchemaUtil.lookupModelObjectSchema(parentParam, rootSchema);
            const grandFatherCurrentSchemas = grandFatherSchemas[Constants.PARENT_SCHEMA];
            let grandFatherParam = null;
            if (grandFatherCurrentSchemas) {

                grandFatherParam = {
                    'ModelName': parentSchema[Constants.DD_MODEL_NAME],
                    'ObjectCode': parentSchema[Constants.DD_OBJECT_CODE],
                    'ParentModelName': grandFatherCurrentSchemas[Constants.DD_MODEL_NAME],
                    'ParentObjectCode': grandFatherCurrentSchemas[Constants.DD_OBJECT_CODE],
                    'ProductId': param[Constants.PRODUCT_ID],
                };

            } else {

                grandFatherParam = {
                    'ModelName': parentSchema[Constants.DD_MODEL_NAME],
                    'ObjectCode': parentSchema[Constants.DD_OBJECT_CODE],
                    'ProductId': param[Constants.PRODUCT_ID],
                };

            }


            let parentObjectArray = this.getModelObject(grandFatherParam, rootObject);
            let parentObject = null;

            if (_.isArray(parentObjectArray)) {
                parentObject = _.find(parentObjectArray, (pobj) => {
                    return pobj[Constants.TEMP_DATA][Constants.UU_ID] == param[Constants.UU_ID];
                })
            } else {
                parentObject = parentObjectArray;
            }



            if (_.isEmpty(parentObject)) {
                parentObject = this.initModelObject(parentSchema);
            }
            const key = this._getKey(parentSchema, param);
            console.assert(key, `${parentSchema[Constants.DD_MODEL_NAME]} Schema not define child ${JSON.stringify(param)}`);

            if (parentSchema[Constants.RELATION_TYPE] == Constants.RELATION_TYPE_MORE) {
                if (_.isEmpty(parentObject[key])) {
                    parentObject[key] = [child];
                } else {
                    let flag = false;
                    _.each(parentObject[key], (obt) => {
                        if (this._isSameObject(obt, child)) {
                            obt = child;
                            flag = true;
                        }
                    });
                    if (!flag) {
                        parentObject[key].push(child);
                    }
                }
            } else {
                parentObject[key] = child;
            }
            // this.setModelObject(parentParam, parentObject, rootObject, rootSchema);
        }
    },

    getModelObject(param, object) {
        if (this._checkObject(object, param)) {
            return object;
        } else {
            if (param[Constants.SCOPE_MODEL_NAME] && param[Constants.SCOPE_OBJECT_CODE]) {
                const scopeParam = { "ModelName": param[Constants.SCOPE_MODEL_NAME], "ObjectCode": param[Constants.SCOPE_OBJECT_CODE] };
                const scopeObjects = this.lookupModelObject(scopeParam, object);
                const returnObjects = [];
                if (_.isArray(scopeObjects)) {
                    _.each(scopeObjects, (scopeObject) => {
                        const renturnObj = this.lookupModelObject(param, scopeObject);
                        if (_.isArray(renturnObj)) {
                            _.union(returnObjects, renturnObj);
                        } else {
                            returnObjects.push(renturnObj);
                        }
                    });
                    return returnObjects;
                } else {
                    return this.lookupModelObject(param, scopeObjects);
                }
            } else {
                return this.lookupModelObject(param, object);
            }
        }
    },



    _isSameObject(object1, object2) {
        if (object1 && object2 && object1[Constants.COMM_PK] && object2[Constants.COMM_PK] && object1[Constants.COMM_PK] == object2[Constants.COMM_PK]) {
            return true;
        } else if (object1 && object2 && object1[Constants.TEMP_DATA] && object2[Constants.TEMP_DATA] && object1[Constants.TEMP_DATA]["uuid"] && object2[Constants.TEMP_DATA]["uuid"] && object1[Constants.TEMP_DATA]["uuid"] == object2[Constants.TEMP_DATA]["uuid"]) {
            return true;
        } else {
            return false;
        }
    },

    _checkObject(object, param) {
        if (object && object[Constants.COMM_TYPE] == `${param[Constants.DD_MODEL_NAME]}-${param[Constants.DD_OBJECT_CODE]}`) {
            return true;
        } else {
            return false;
        }
    },

    _getKey(parentSchema, param) {
        const childElements = parentSchema[Constants.CHILD_ELEMENTS];
        console.assert(childElements, `childElements is null`);
        const tempParam = ObjectUtil.clone(param);
        delete tempParam[Constants.UU_ID];
        let returnKey = null;
        if (!_.isEmpty(childElements)) {
            _.each(_.keys(childElements), (key) => {
                if (_.isArray(childElements[key])) {
                    _.each(childElements[key], (item) => {
                        if (this._checkObject(item, tempParam)) {
                            returnKey = key;
                        }
                    });
                } else {
                    if (this._checkObject(item, tempParam)) {
                        returnKey = key;
                    }
                }
            });
        }
        return returnKey;
    },

    _getDefaultValue(filed) {
        const defaultValue = _.find(_.keys(filed), (_fild) => {
            return Constants.DEFAULT_VALUE == _fild;
        });
        if (defaultValue) {
            return filed[Constants.DEFAULT_VALUE];
        } else {
            return null;
        }
    },

    storeModelObject(key, value) {
        //set policy into memory
        SessionContext.put(key, value);
        //set policy into sessionStore
    },

    compareObject(object1,object2) {
        return jiff.diff(object1, object2);
    },

    deleteModelObjectUUID(ModelObject) {
        _.each(_.keys(ModelObject), (key) => {
            if (key == "uuid") {
                delete ModelObject[key];
            }
            if (_.isArray(ModelObject[key])) {
                _.each(ModelObject[key], (item) => {
                    this.deleteModelObjectUUID(item);
                });
            } else if (_.isObject(ModelObject[key])) {
                this.deleteModelObjectUUID(ModelObject[key]);
            }
        });
    },

    deleteModelObjectClientProperty(ModelObject) {
        _.each(_.keys(ModelObject), (key) => {
            if (key == Constants.DATA_INDEX || key == Constants.VERSION_FOR_CLIENT) {
                delete ModelObject[key];
            }
            if (_.isArray(ModelObject[key])) {
                const newArray = [];
                _.each(ModelObject[key], (item) => {
                    const selectflag = item[Constants.CLEAN_FROM_CLIENT];
                    if (!_.isEmpty(selectflag)) {
                       if ('N' == selectflag) {
                            delete item[Constants.CLEAN_FROM_CLIENT];
                            newArray.push(item);
                        }
                    }else{
                           newArray.push(item);
                    }
                    this.deleteModelObjectClientProperty(item);
                });
                ModelObject[key] = newArray;
            } else if (_.isObject(ModelObject[key])) {
                const selectflag = ModelObject[key][Constants.CLEAN_FROM_CLIENT];
                if (!_.isEmpty(selectflag)) {
                    if ('Y' == selectflag) {
                        delete ModelObject[key]
                    } else {
                        delete ModelObject[key][Constants.CLEAN_FROM_CLIENT];
                    }
                }
                this.deleteModelObjectClientProperty(ModelObject[key]);
            }
        });
    },

    lookupModelObject(param, object) {
        let returnObject = new Map();
        const uuid = param[Constants.UU_ID];
        const tempParam = ObjectUtil.clone(param);
        if (uuid) {
            delete tempParam[Constants.UU_ID];
        }
        this._lookupModelObject(tempParam, object, returnObject, object);

        if (returnObject.size == 1) {
            let returnValue = null;
            returnObject.forEach(function (value, key, mapObj) {
                returnValue = value;
            });
            return returnValue.length == 1 ? returnValue[0] : returnValue;
        } else {
            if (uuid) {
                const returnValue = returnObject.get(uuid);
                return returnValue.length == 1 ? returnValue[0] : returnValue;
            } else {
                const returnList = [];
                returnObject.forEach(function (value, key, mapObj) {
                    $.merge(returnList, value);
                });
                return returnList.length == 1 ? returnList[0] : returnList;
            }
        }

        // return returnObject.length == 1 ? returnObject[0] : returnObject;
    },

    _checkObjectByUUID(object, param, parentObject) {
        if (object && object[Constants.COMM_TYPE] == `${param[Constants.DD_MODEL_NAME]}-${param[Constants.DD_OBJECT_CODE]}`) {
            if (parentObject && param[Constants.PARENT_MODEL_NAME] && param[Constants.PARENT_OBJECT_CODE]) {
                const parentParam = this.buildPrarm(parentObject);
                if (parentParam[Constants.DD_MODEL_NAME] == param[Constants.PARENT_MODEL_NAME] && parentParam[Constants.DD_OBJECT_CODE] == param[Constants.PARENT_OBJECT_CODE]) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        } else {
            return false;
        }
    },

    _lookupModelObject(param, object, returnObject, parentObject) {
        if (this._checkObjectByUUID(object, param, parentObject)) {
            const childObject = returnObject.get(parentObject[Constants.TEMP_DATA][Constants.UU_ID]);
            if (childObject) {
                childObject.push(object);
            } else {
                returnObject.set(parentObject[Constants.TEMP_DATA][Constants.UU_ID], [object]);
            }
        }
        _.each(_.keys(object), (key) => {
            const targetObject = object[key];
            if (_.isArray(targetObject)) {
                _.each(targetObject, (tob) => {
                    this._lookupModelObject(param, tob, returnObject, object);
                });
            } else if (_.isObject(targetObject)) {
                if (this._checkObjectByUUID(targetObject, param, null)) {
                    const childObject = returnObject.get(targetObject[Constants.TEMP_DATA][Constants.UU_ID]);
                    if (childObject) {
                        childObject.push(object);
                    } else {
                        returnObject.set(targetObject[Constants.TEMP_DATA][Constants.UU_ID], [targetObject]);
                    }
                }
            }
        });
    },

    deleteModelObject(object, rootObject) {
        _.each(_.keys(rootObject), (key) => {
            const targetObject = rootObject[key];
            if (_.isArray(targetObject)) {
                const _array = [];
                _.each(rootObject[key], (tob) => {
                    if (!this._isSameObject(tob, object)) {
                        _array.push(tob);
                    }
                    this.deleteModelObject(object, tob);
                });
                rootObject[key] = _array;
            } else {
                if (this._isSameObject(targetObject, object)) {
                    delete rootObject[key];
                }
            }
        });
        return rootObject;
    },

    getObject(key, id) {
        return SessionContext.get(`${key}${Constants.COMM_CONNECTOR}${id}`);
    },

    setObject(object, key, id) {
        if (object["Result"]) {
            this.storeModelObject(`${key}${Constants.COMM_CONNECTOR}${object["Result"][id]}`, object["Result"]);
        } else {
            this.storeModelObject(`${key}${Constants.COMM_CONNECTOR}${object[id]}`, object);
        }
    },
    getChild(param, object, productId) {
        param[Constants.PRODUCT_ID] = productId;
        const child = this.getModelObject(param, object);
        if (_.isEmpty(child)) {
            return null;
        } else {
            return child;
        }
    },
    initChild(param, rootSchema, productId) {
        param[Constants.PRODUCT_ID] = productId;
        const schema = SchemaUtil.lookupModelObjectSchema(param, rootSchema);
        console.assert(schema, `${JSON.stringify(schema)} lookup schema is null`);
        return this.initModelObject(schema["CURRENT_SCHEMA"]);
    },
    setChild(child, object, param, rootSchema, productId) {
        if (!param) {
            param = SchemaUtil.getModeNameAndObjectCode(child[Constants.COMM_TYPE]);
            param[Constants.PRODUCT_ID] = productId;
        }
        if (param[Constants.SCOPE_MODEL_NAME] && param[Constants.SCOPE_OBJECT_CODE]) {
            const scopeParam = { "ModelName": param[Constants.SCOPE_MODEL_NAME], "ObjectCode": param[Constants.SCOPE_OBJECT_CODE] };
            const scopeObject = this.getModelObject(scopeParam, object);
            if (_.isArray(scopeObject)) {
                console.assert(false, `${param[Constants.SCOPE_MODEL_NAME]} find more object, please use UUID.`);
            } else {
                this.setModelObject(param, child, scopeObject, rootSchema);
            }
        } else {
            this.setModelObject(param, child, object, rootSchema);
        }
        return object;

    },
    deleteChild(childs, object) {
        console.assert(childs, `child is null`);
        if (_.isArray(childs)) {
            _.each(childs, (child) => {
                this.deleteModelObject(child, object);
            });
        } else {
            this.deleteModelObject(childs, object);
        }
        return object;
    },
    buildPrarm(object) {
        const type = object[Constants.COMM_TYPE];
        const _temp = type.split("-");
        return { "ModelName": _temp[0], "ObjectCode": _temp[1] }
    }
}