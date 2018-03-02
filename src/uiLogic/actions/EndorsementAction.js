/**
 * Created by sam on 2017/7/12.
 */
import ClassCreater from '../utils/ClassCreater';
import ObjectStore from '../stores/ObjectStore';
import PolicyStore from '../stores/PolicyStore';
import UrlConfigConstants from '../../constants/UrlConfigConstants';
import ObjectSchemaActions from './ObjectSchemaActions';
import ObjectSchemaStore from '../stores/ObjectSchemaStore';
import ObjectActions from './ObjectActions';
import ObjectService from '../services/ObjectService';
import Constants from '../../constants/Constants';
import {ObjectUtil, DateUtil} from 'rainbow-foundation-tools';
import DataUtils from '../utils/DataUtils';
import config from 'config';
import {SessionContext} from 'rainbow-foundation-cache';
/**
 * @module EndorsementAction
 */
module.exports = {

    /**
     * create a new endorsement object.The new endorsement will be flush to the store.
     * @example
     * const param ={
     * };
     */
    createEndorsement(param) {
        return new Promise((resolve, reject) => {
            ObjectSchemaActions.getModelObjectSchema('Endorsement', 'Endorsement', Constants.COMMON_CONTEXT_TYPE, Constants.COMMON_CONTEXT_TYPE).then((schema) => {
                ObjectActions.getEmptyModelObjectByBusinessObject(schema).then((endorsement) => {
                    if (param.CreateEndorsementUrl) {
                        endorsement["PolicyId"] = param.PolicyId;
                        endorsement["TypeId"] = param.TypeId;
                        endorsement["SubEndoType"] = param.SubEndoType;
                        endorsement["EffDate"] = param.EffDate;
                        endorsement["IsOOSCase"] = 0;
                        endorsement["BeforeRevisionId"] = param.BeforeRevisionId;
                        AjaxUtil.call(param.CreateEndorsementUrl, endorsement, {'method': 'POST', 'extractPolicyCoverageListUnderPlan': 'Y'}).then((endorsementNew) => {
                            resolve(endorsementNew['Model']);
                        });
                    } else {
                        resolve(endorsement);
                    }

                });
            });

        }, function (error) {
            console.error(error);
            reject(error)
        })

    },

    /**
     * save  api .The new endorsement of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} option
     * @example
     * AjaxUtil.show();
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',ENDORSEMENT_API','SAVE_POLICY');
     * EndorsementAction.saveEndorsement(endorsement).then((policy)=>{
     *       AjaxUtil.hide();
     *       UIMessageHelper.info("操作成功！",null, null);
     * })
     */
    saveEndorsement(url, object) {
        let setting = {'method': 'POST', 'extractPolicyCoverageListUnderPlan': 'Y'};
        const policy = object.Policy;
        const _productVersion = policy["ProductVersion"];
        delete object.Policy["ProductVersion"];
        DataUtils.clearDirtyData(object);
        DataUtils.cleanDomainInstanceByFlag(object.Policy, ObjectSchemaStore.getBusinessObjectByObjectId(object.Policy.BusinessObjectId), ObjectSchemaStore.getAllSchemaObjects());
        const urlSave = url==null ?UrlConfigConstants['ENDORSEMENT_API']['SAVE_ENDORSEMENT'] : url;
        return new Promise((resolve, reject) => {
            AjaxUtil.call(urlSave, object, setting).then((endorsement) => {
                let policy = endorsement['Model'].Policy;
                policy["ProductVersion"] = _productVersion;
                PolicyStore.setPolicy(policy);
                resolve(endorsement['Model']);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
     * call  api .The new endorsement of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} option
     * @example
     * AjaxUtil.show();
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',ENDORSEMENT_API','');
     * EndorsementAction.call(url,endorsement).then((endoresement)=>{
     *       AjaxUtil.hide();
     *       UIMessageHelper.info("操作成功！",null, null);
     * })
     */
    call(url, object, option) {
        let setting = option == null ? {'method': 'POST', 'extractPolicyCoverageListUnderPlan': 'Y'} : option;
        const policy = object.Policy;
        const _productVersion = policy["ProductVersion"];
        delete object.Policy["ProductVersion"];
        DataUtils.clearDirtyData(object);
        DataUtils.cleanDomainInstanceByFlag(object.Policy, ObjectSchemaStore.getBusinessObjectByObjectId(object.Policy.BusinessObjectId), ObjectSchemaStore.getAllSchemaObjects());
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, object, setting).then((endorsement) => {
                let policy = endorsement['Model'].Policy;
                policy["ProductVersion"] = _productVersion;
                PolicyStore.setPolicy(policy);
                resolve(endorsement['Model']);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })

    },

    /**
     * load  endorsement object.The new policy will be flush to the store
     * @param  {String} url
     * @example
     * AjaxUtil.show();
     * const self = this;
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',ENDORSEMENT_API','LOAD_ENDORSEMENT');
     * EndorsementAction.loadEndorsement(url).then((endorsement)=>{
     *           self.gotoPath(path);
     * })
     */
    loadEndorsement(url) {
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url).then((returnEndorsement) => {
                let returnPolicy = returnEndorsement.Policy;
                const getProductUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_PRODUCT_ID']}${returnPolicy["ProductId"]}`;
                AjaxUtil.call(getProductUrl).then((product) => {
                    const policy = PolicyStore.setPolicy(returnPolicy);
                    returnEndorsement.Policy["ProductVersion"] = product.ProductVersion;
                    resolve(returnEndorsement);
                });
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    }

}