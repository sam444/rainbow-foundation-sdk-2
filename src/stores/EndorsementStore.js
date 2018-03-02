import PolicyStore from './PolicyStore';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import ObjectStore from './ObjectStore';
import Constants from '../constants/Constants';
import { ObjectUtil, DateUtil } from 'rainbow-foundation-tools';
import config from 'config';
import { SessionContext } from 'rainbow-foundation-cache';
import SchemaUtil from "../schema/SchemaUtil";
/**
 * @module EndorsementStore
 */
module.exports = {
    /**
     * create a new endorsement object with insert into db The new endorsement will be flush to the store.
     * @param  {String} url
     * @param  {String} EndorsementType
     * @param  {Object} param
     * @example 
     *   import {EndorsementStore} from 'rainbow-foudation-sdk';
     *   AjaxUtil.show();
     *   const url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "ENDORSEMENT_API", "CREATE_ENDORSEMENT");
     *   const param = {
     *       "EndoEffectiveDate":"2017-11-25T15:23:59",
     *       "PolicyId":98307011,
     *       "ProductId":12451314
     *   }
     *   EndorsementStore.createEndorsement(url,"BasicInfoEndorsement",param).then((endorsement) => {
     *       this.setState({endorsement:endorsement});
     *       AjaxUtil.hide();
     *   });
     */
    createEndorsement(url, type, param) {
        param[Constants.COMM_TYPE] = "Endorsement-" + type;
        return this.commonPromise(url, param, { 'method': 'POST' });
    },
    /**
     * init a new endorsement object without insert into db The new endorsement will be flush to the store.
     * @param  {String} EndorsementType
     * @example 
     *   import {EndorsementStore} from 'rainbow-foudation-sdk';
     *   EndorsementStore.initEndorsement("BasicInfoEndorsement");
     */
    initEndorsement(type, param) {
        const endorsement = {};
        endorsement[Constants.COMM_TYPE] = "Endorsement-" + type;
        this.setEndorsement(endorsement);
        return endorsement;
    },
    /**
    * update endorsement object.The new endorsement of back end return will be flush to the store
    * @param  {String} url
    * @param  {Object} endorsement
    * @example
    *    import {EndorsementStore} from 'rainbow-foudation-sdk';
    *    AjaxUtil.show();
    *    const url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "ENDORSEMENT_API", "UPDATE_ENDORSEMENT");
    *    EndorsementStore.updateEndorsement(url,this.state.endorsement).then((endorsement) => {
    *        this.setState({endorsement:endorsement});
    *        AjaxUtil.hide();
    *    });
    */
    updateEndorsement(url, endorsement) {
        this.convertPolicyDiffToString(endorsement);
        return this.commonPromise(url, endorsement, { 'method': 'POST' });
    },
    /**
    * issue endorsement object.The new endorsement of back end return will be flush to the store
    * @param  {String} url
    * @param  {Object} endorsement
    * @example
    *    import {EndorsementStore} from 'rainbow-foudation-sdk';
    *    AjaxUtil.show();
    *    const url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "ENDORSEMENT_API", "UPDATE_ENDORSEMENT");
    *    EndorsementStore.issueEndorsement(url,this.state.endorsement).then((endorsement) => {
    *        this.setState({endorsement:endorsement});
    *        AjaxUtil.hide();
    *    });
    */
    issueEndorsement(url, endorsement) {
        this.convertPolicyDiffToString(endorsement);
        return this.commonPromise(url, endorsement, { 'method': 'POST' });
    },

    /**
     * call  api .The new endorsement of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {EndorsementStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * const saving_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "ENDORSEMENT_API", "UPDATE_ENDORSEMENT");
     * EndorsementStore.call(saving_url, this.state.endorsement, { "method": "POST"}).then((endorsement) => {
     *       this.setState({endorsement:endorsement});
     *       AjaxUtil.hide();
     * });
     */
    call(url, object, option) {
        if (this.isEndorsement(object)) {
            this.convertPolicyDiffToString(object);
        }
        return this.commonPromise(url, object, option);
    },
    /**
    *  get a endorsement object from store.
    *  @param  {Number} endorsementId
    *  @example 
    *  import {EndorsementStore} from 'rainbow-foudation-sdk';
    *  EndorsementStore.getEndorsement(endorsementId);
    */
    getEndorsement(key) {
        const endorsement = SessionContext.get(`${Constants.SESSION_ENDORSEMENT_KEY}${Constants.COMM_CONNECTOR}${key}`);
        return endorsement;
    },
    /**
    *  set a endorsement object from store.
    *  @param  {Object} endorsement
    *  @example 
    *  import {EndorsementStore} from 'rainbow-foudation-sdk';
    *  EndorsementStore.setEndorsement(endorsement);
    */
    setEndorsement(endorsement) {
        if (endorsement["Result"]) {
            ObjectStore.storeModelObject(`${Constants.SESSION_ENDORSEMENT_KEY}${Constants.COMM_CONNECTOR}${endorsement["Result"]["EndoId"]}`, endorsement["Result"]);
        } else {
            ObjectStore.storeModelObject(`${Constants.SESSION_ENDORSEMENT_KEY}${Constants.COMM_CONNECTOR}${endorsement["EndoId"]}`, endorsement);
        }
    },
    /**
     * load  endorsement object.The new policy will be flush to the store
     * @param  {String} url
     * @example
     *  import {URLUtil} from 'rainbow-foudation-tools';
     *  AjaxUtil.show();
     *   const load_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "ENDORSEMENT_API", "LOAD_ENDORSEMENT");
     *   EndorsementStore.loadEndorsement(load_url + this.state.endorsement["EndoId"]).then((endorsement) => {
     *       this.setState({code:super.formatJson(endorsement),endorsement:endorsement});
     *       AjaxUtil.hide();
     *   });
     */
    loadEndorsement(url) {
        return this.commonPromise(url, null, null);
    },

    convertPolicyDiffToJSON(endorsement) {
        if (endorsement && endorsement["PolicyDiff"]) {
            endorsement["PolicyDiff"] = JSON.parse(endorsement["PolicyDiff"]);
        }
    },

    convertPolicyDiffToString(endorsement) {
        if (endorsement && endorsement["PolicyDiff"]) {
            endorsement["PolicyDiff"] = JSON.stringify(endorsement["PolicyDiff"]);
        }
    },

    commonPromise(url, object, option) {
        return new Promise((resolve, reject) => {
            ObjectStore.deleteModelObjectClientProperty(object);
            AjaxUtil.call(url, object, option).then((returnEndorsement) => {
                let endorsement = returnEndorsement;
                if (returnEndorsement["Result"]) {
                    endorsement = returnEndorsement["Result"];
                }
                if (this.isEndorsement(endorsement)) {
                    this.convertPolicyDiffToJSON(endorsement);
                    this.setEndorsement(endorsement);
                    ObjectStore.setModelObjectUUID(endorsement);
                    SchemaUtil.loadModelObjectSchema(Constants.POLICY, Constants.POLICY, endorsement["NewPolicy"][Constants.PRODUCT_ID], Constants.PRODUCT_CONTEXT_TYPE).then((schema) => {
                        PolicyStore.setPolicy(endorsement["NewPolicy"]);
                        if (endorsement["OldPolicy"]) {
                            PolicyStore.setPolicy(endorsement["OldPolicy"]);
                        }
                        resolve(endorsement);
                    });
                } else {
                    resolve(endorsement);
                }

            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    isEndorsement(object) {
        if (object[Constants.COMM_TYPE] && object[Constants.COMM_TYPE].indexOf(Constants.ENDORSEMENT) >= 0) {
            return true;
        } else {
            return false;
        }
    },
    /**
     * compare  new policy and old policy field, return add,remove,replace,none,customClass base on new Policy .
     * @param  {Object} endorsement
     * @param  {Object} param --{"path":"/TempData/uuid","className":"customerClass"} the className is option  
     * @example
     * import {EndorsementStore} from 'rainbow-foudation-sdk';
     * endorsement["NewPolicy"]["selectflag"]='true';
     * console.log(EndorsementStore.compareField(endorsement,{"path":"/selectflag"}));--add
     * delete endorsement["NewPolicy"]["ProductElement"]["Description"];--remove
     * console.log(EndorsementStore.compareField(endorsement,{"path":"/ProductElement/Description"}));--replace
     * console.log(EndorsementStore.compareField(endorsement,{"path":"/TempData/uuid"}));--replace
     * console.log(EndorsementStore.compareField(endorsement,{"path":"/TempData/uuid","className":"customerClass"}));--customerClass
     * console.log(EndorsementStore.compareField(endorsement,{"path":"/abc/abc"}));--none
     */
    compareField(endorsement,param) {
        if (param.className) {
            return param.className;
        } else {
            const patchs = ObjectStore.compareObject(endorsement["OldPolicy"], endorsement["NewPolicy"]);
            let resault = null;
            const returnList = _.filter(patchs, (_temPath) => {
                if(_temPath.op=="test"){
                    return false;
                }else{
                    return param.path == _temPath.path;
                }
            });
            if (!_.isEmpty(returnList)) {
                return returnList[0]["op"];
            } else {
                return "none";
            }
        }
    },
    /**
     * compare  new policy and old policy list, return add,remove array base on new Policy .
     * @param  {Object} endorsement
     * @param  {Object} param
     * @example
     * import {EndorsementStore} from 'rainbow-foudation-sdk';
     * endorsement["NewPolicy"]['PolicyLobList'][0]["selectFlag"]=true;
     * endorsement["NewPolicy"]['PolicyLobList'][1]["selectFlag"]=false;
     *
     * endorsement["OldPolicy"]['PolicyLobList'][0]["selectFlag"]=false;
     * endorsement["OldPolicy"]['PolicyLobList'][1]["selectFlag"]=false;
     * console.log(EndorsementStore.compareList(endorsement,{"path":"/PolicyLobList","selectflag":"selectFlag"}));
     */
    compareList(endorsement,param) {
            ObjectStore.deleteModelObjectUUID(endorsement);
            const patchs = ObjectStore.compareObject(endorsement["OldPolicy"], endorsement["NewPolicy"]);
            ObjectStore.setModelObjectUUID(endorsement);

            let resault = {"add":new Set(),"remove":new Set()};

            const _resaultList = _.filter(patchs, (_temPath) => {
                return _temPath.path.indexOf(param.path)>=0;
            });

            // console.log(_resaultList)

            _.each(_resaultList,(_resault)=>{
                if(_resault.op=="add"){
                    const returnObjects = _.filter(_resaultList,(_item)=>{
                        return _item.op=="test"&&_resault.value&&_item.value[Constants.COMM_PK]==_resault.value[Constants.COMM_PK];
                    });

                    if(_.isEmpty(returnObjects)&&_resault.value){
                        resault.add.add(_resault.path.substring(_resault.path.lastIndexOf("/")+1));
                    }else{
                        _.each(returnObjects,(returnObject)=>{
                            if(returnObject.value[param.selectflag]==false){
                                resault.add.add(_resault.path.substring(_resault.path.lastIndexOf("/")+1));
                            }
                        });
                    }
                }
                if(_resault.op=="test"){
                        const returnObjects = _.filter(_resaultList,(_item)=>{
                            return _item.op=="add" && _item.value && _item.value[Constants.COMM_PK ]== _resault.value[Constants.COMM_PK];
                        });
                        _.each(returnObjects,(returnObject)=>{
                            if(returnObject.value[param.selectflag]==false){
                                resault.remove.add(returnObject.path.substring(returnObject.path.lastIndexOf("/")+1));
                            }
                        });
                }
            });
            const  add = [];
            const  remove = [];
            if(_.isEmpty(resault.add)){
                for(const addItem of resault.add){
                    add.push(addItem);
                }
            }
            if(_.isEmpty(resault.remove)){
                for(const removeItem of resault.remove){
                    remove.push(removeItem);
                }
            }
            return {"add":add,"remove":remove};
    }
}