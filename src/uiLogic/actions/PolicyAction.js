import ClassCreater from '../utils/ClassCreater';
import ObjectStore from '../stores/ObjectStore';
import PolicyStore from '../stores/PolicyStore';
import UrlConfigConstants from '../../constants/UrlConfigConstants';
import ObjectSchemaActions from './ObjectSchemaActions';
import ObjectSchemaStore from '../stores/ObjectSchemaStore';
import ObjectActions from './ObjectActions';
import ObjectService from '../services/ObjectService';
import Constants from '../../constants/Constants';
import { ObjectUtil, DateUtil } from 'rainbow-foundation-tools';
import DataUtils from '../utils/DataUtils';
import config from 'config';
import { SessionContext } from 'rainbow-foundation-cache';
/**
 * @module PolicyAction
 */
module.exports = {

    /**
     * create a new policy object by product Code and version.The new policy will be flush to the store.
     * @param  {Object} param  - set productCode,productVersion,effectiveDate,expiryDate,policyType,createPolicyUrl in json object notes: effectiveDate default is current Date and expiryDate default is next year current Date and policyType default is single policy
     * @example 
     * const path = event.getParameter("path");
     * const code = event.getParameter("code");
     * const version = event.getParameter("version");
     * const createPolicyUrl = URLUtil.getConfigURL('POLICY_API','CREATE_POLICY');
     * const sevePolicyUrl = URLUtil.getConfigURL('POLICY_API','SAVE_POLICY');
     * 
     * const param ={
     *       'productCode':code,
     *       'productVersion':version,
     *       'createPolicyUrl':createPolicyUrl
     * };
     * const self = this;
     * AjaxUtil.show();
     * PolicyAction.createPolicy(param).then((policy) => {
     *           self.gotoPath(path);
     * });
     */
    createPolicy(param) {
        const self = this;
        SessionContext.remove(Constants.SESSION_POLICY_KEY);
        SessionContext.remove(Constants.SESSION_SCHEMA_KEY_OBJECT);
        SessionContext.remove(Constants.SESSION_POLICY_SCHEMA_KEY_DATA);
        const getProductIdUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_CODE_VERSION']}code/${param.productCode}/version/${param.productVersion}`;
        const currentDate = new Date();
        const effectiveDate = param.effectiveDate ? DateUtil.formatToSubmitFormater(DateUtil.formatStringToDate(param.effectiveDate, config.DEFAULT_DATETIME_SUBMIT_FORMATER)) : DateUtil.formatToSubmitFormater(currentDate);
        const expiryDate = param.expiryDate ? DateUtil.formatToSubmitFormater(DateUtil.formatStringToDate(param.expiryDate, config.DEFAULT_DATETIME_SUBMIT_FORMATER)) : DateUtil.add(effectiveDate, 1, 'years');
        return new Promise((resolve, reject) => {
            AjaxUtil.call(getProductIdUrl).then((productId) => {
                ObjectSchemaActions.getModelObjectSchema('Policy', 'Policy', productId, Constants.PRODUCT_CONTEXT_TYPE).then((schema) => {
                    ObjectActions.getEmptyModelObjectByBusinessObject(schema).then((tempPolicy) => {
                        tempPolicy["EffectiveDate"] = tempPolicy["EffectiveDate"] ? tempPolicy["EffectiveDate"] : effectiveDate;
                        tempPolicy["ExpiryDate"] = tempPolicy["ExpiryDate"] ? tempPolicy["ExpiryDate"] : expiryDate;
                        tempPolicy["ProductId"] = productId;
                        tempPolicy["PolicyType"] = param.policyType || "1";
                        const fillPolicyUrl = `${UrlConfigConstants['POLICY_API']['FILL_POLICY']}`;
                        const _param = {
                            'BusinessObjectId': tempPolicy["BusinessObjectId"],
                            '@type': 'Policy-POLICY',
                            'ProductId': productId
                        };
                        AjaxUtil.call(fillPolicyUrl, _param, { "method": "POST" }).then((policy) => {
                            if (param.createPolicyUrl) {
                                ObjectActions.createModelObject(tempPolicy, param.createPolicyUrl).then((returnPolicy) => {
                                    resolve(returnPolicy['Model']);
                                })
                            } else {
                                    resolve(tempPolicy);
                            }
                        });
                    });
                })
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })

    },


    /**
    * save  policy object.The new policy of back end return will be flush to the store
    * @param  {String} url
    * @example
    * AjaxUtil.show();
    * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',POLICY_API','SAVE_POLICY');
    * PolicyAction.savePolicy(url).then((policy)=>{
    *       AjaxUtil.hide();
    *       UIMessageHelper.info("保存成功！",null, null);
    * })
    */
    savePolicy(url,policy) {
        const BusinessObjectByObject =  ObjectSchemaStore.getAllSchemaObjectsBykey(policy["ProductId"]);
        DataUtils.cleanDomainInstanceByFlag(policy,
            ObjectSchemaStore.getBusinessObjectByObjectId(policy.BusinessObjectId),BusinessObjectByObject);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, policy, { 'method': 'POST' }).then((returnPolicy) => {
                resolve(returnPolicy['Model']);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
     * call  api .The new policy of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} option
     * @example
     * AjaxUtil.show();
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',POLICY_API','SAVE_POLICY');
     * PolicyAction.call(url,{'method':'POST'}).then((policy)=>{
     *       AjaxUtil.hide();
     *       UIMessageHelper.info("操作成功！",null, null);
     * })
     */
    call(url, option) {
        const policy = ObjectStore.getModelObject()['Model'];
        const _productVersion = policy["ProductVersion"];
        delete policy["ProductVersion"];
        DataUtils.cleanDomainInstanceByFlag(policy,
            ObjectSchemaStore.getBusinessObjectByObjectId(policy.BusinessObjectId), ObjectSchemaStore.getAllSchemaObjects(Constants.SESSION_POLICY_SCHEMA_KEY_DATA));
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, policy, option).then((returnPolicy) => {
                returnPolicy['Model']["ProductVersion"] = _productVersion;
                PolicyStore.setPolicy(returnPolicy);
                resolve(returnPolicy['Model']);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
     * load  policy object.The new policy will be flush to the store
     * @param  {String} url
     * @example
     * AjaxUtil.show();
     * const self = this;
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',POLICY_API','LOAD_POLICY');
     * PolicyAction.loadPolicy(url).then((policy)=>{
     *           self.gotoPath(path);
     * })
     */
    loadPolicy(url) {
        SessionContext.remove(Constants.SESSION_POLICY_KEY);
        SessionContext.remove(Constants.SESSION_SCHEMA_KEY_OBJECT);
        SessionContext.remove(Constants.SESSION_POLICY_SCHEMA_KEY_DATA);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url).then((returnPolicy) => {
                ObjectSchemaActions.getModelObjectSchema('Policy', 'Policy', returnPolicy["ProductId"], Constants.PRODUCT_CONTEXT_TYPE).then((schema) => {
                    debugger;

                    ObjectSchemaStore.setModelObjectSchemaData(Constants.SESSION_POLICY_SCHEMA_KEY_DATA, schema);
                    DataUtils.createNewDomainObjectByBusinessObject({}, schema);
                    const getProductUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_PRODUCT_ID']}${returnPolicy["ProductId"]}`;
                    AjaxUtil.call(getProductUrl).then((product) => {
                        const policy = PolicyStore.setPolicy(returnPolicy);
                        policy['Model']["ProductVersion"] = product.ProductVersion;
                        resolve(policy['Model']);
                    });
                })
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    }

}
