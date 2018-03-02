import Constants from '../constants/Constants';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import { SessionContext } from 'rainbow-foundation-cache';
module.exports = {

    getSchemaKey(modelName, objectCode, productId) {
        return `${Constants.DD_SCHEMA_DATA_KEY}${Constants.COMM_CONNECTOR}${modelName}${Constants.COMM_CONNECTOR}${objectCode}${Constants.COMM_CONNECTOR}${productId}`;
    },

    getModeNameAndObjectCode(type) {
        const temp = type.split("-");
        return { "ModelName": temp[0], "ObjectCode": temp[1] };
    },

    loadModelObjectSchema(modelName, objectCode, productId, contextType) {
        return new Promise((resolve, reject) => {
            const key = this.getSchemaKey(modelName, objectCode, productId);
            let uiProductSchemaData = SessionContext.get(key);
            if (uiProductSchemaData) {
                resolve(uiProductSchemaData);
            } else {
                let data = {
                    modelName: modelName,
                    objectCode: objectCode,
                    contextType: contextType || Constants.PRODUCT_CONTEXT_TYPE,
                    referenceId: productId
                };
                AjaxUtil.call(UrlConfigConstants.DD.product_dd_schema, data, { method: 'GET' })
                    .then(response => {
                        this.saveAndDeleteFields(response);
                        SessionContext.put(key, response, true);
                        resolve(response)
                    });
            }
        });
    },

    saveAndDeleteFields(object) {
        if (object["Fields"]) {
            //SessionContext.put(object[Constants.COMM_TYPE], object["Fields"]);
            delete object["Fields"];
        }
        const childs = object["ChildElements"];
        if (childs) {
            _.each(_.keys(childs), (key) => {
                if (_.isArray(childs[key])) {
                    _.each(childs[key], (child) => {
                        this.saveAndDeleteFields(child);
                    });
                } else {
                    this.saveAndDeleteFields(childs[key]);
                }
            });
        }
    },

    getFields(object) {
        return SessionContext.get(object[Constants.COMM_TYPE]);
    },
    getSchemaByModelName(param, schema) {
        const returnObject = [];
        if (schema) {
            this._getSchemaByModelName(param,schema,returnObject,schema);
            return returnObject
        } else {
            return null;
        }
    },
    _getSchemaByModelName(param, schema, returnObject, parentSchema) {
        if (schema[Constants.DD_MODEL_NAME] == param[Constants.DD_MODEL_NAME]) {
            if(param[Constants.PARENT_MODEL_NAME]&&parentSchema){
                if(param[Constants.PARENT_MODEL_NAME] == parentSchema[Constants.DD_MODEL_NAME]){
                    returnObject.push(schema);
                }
            }else{
                returnObject.push(schema);
            }
        }
        const childElements = schema[Constants.CHILD_ELEMENTS];
        if (childElements) {
            _.each(_.keys(childElements), (child) => {
                _.each(childElements[child], (childElement) => {
                    this._getSchemaByModelName(param,childElement,returnObject,schema);
                });
            });
        }
    },
    lookupModelObjectSchema(param, schema) {
        const productId = param[Constants.PRODUCT_ID];
        const returnObject = {};
        if (schema) {
            this._lookupModelObjectSchema(null, schema, param, returnObject);
            if (param[Constants.PARENT_MODEL_NAME] && param[Constants.PARENT_OBJECT_CODE]) {
                const parent_param = { "ModelName": param[Constants.PARENT_MODEL_NAME], "ObjectCode": param[Constants.PARENT_OBJECT_CODE], "ProductId": productId };
                const returnSchema = this.lookupModelObjectSchema(parent_param, schema);
                returnObject["PARENT_SCHEMA"] = returnSchema[Constants.CURRENT_SCHEMA];
            }
            return returnObject
        } else {
            return null;
        }
    },

    _lookupModelObjectSchema(parentSchema, schema, param, returnObject) {
        if (schema[Constants.DD_MODEL_NAME] == param[Constants.DD_MODEL_NAME] && schema[Constants.DD_OBJECT_CODE] == param[Constants.DD_OBJECT_CODE]) {
            returnObject["CURRENT_SCHEMA"] = schema;
            returnObject["PARENT_SCHEMA"] = parentSchema;
        }
        const childElements = schema[Constants.CHILD_ELEMENTS];
        if (childElements) {
            _.each(_.keys(childElements), (child) => {
                _.each(childElements[child], (childElement) => {
                    this._lookupModelObjectSchema(schema, childElement, param, returnObject);
                });
            });
        }
    }



}

