import ObjectStore from './ObjectStore';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import Constants from '../constants/Constants';
import { ObjectUtil, DateUtil } from 'rainbow-foundation-tools';
import config from 'config';
import { SessionContext } from 'rainbow-foundation-cache';
import SchemaUtil from "../schema/SchemaUtil";
import PolicyStore from "./PolicyStore";
/**
 * @module AppDataStore
 */
module.exports = {
    /**
     * create a new AppData object.The new AppData will be flush to the store.
     * @example 
     * import {AppDataStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * AppDataStore.initAppData().then((appdata) => {
     *       this.setState({appdata:appdata });
     *       AjaxUtil.hide();
     * })
     */
    initAppData() {
        return new Promise((resolve, reject) => {
            SchemaUtil.loadModelObjectSchema(Constants.APP_DATA, Constants.APP_DATA_CODE, Constants.COMMON_CONTEXT_TYPE, Constants.COMMON_CONTEXT_TYPE).then((appdataSchema) => {
                    const appdata = ObjectStore.initModelObject(appdataSchema);
                    resolve(appdata);
            })
        }, function (error) {
            console.error(error);
            reject(error)
        })

    },
   
    /**
    *   get  Schema from AppData.
    *   @example 
    *    import {AppDataStore} from 'rainbow-foudation-sdk';
    *    getAppDataSchema() {
    *    this.setState({ schema:AppDataStore.getAppDataSchema()});
    *    }
    */
    getAppDataSchema(){
        const key = SchemaUtil.getSchemaKey(Constants.APP_DATA,Constants.APP_DATA_CODE,Constants.COMMON_CONTEXT_TYPE);
        return SessionContext.get(key);
    },
     /**
    * save  appdata object.The new appdata of back end return will be flush to the store
    * @param  {String} url
    * @param  {Object} appdata
    * @example
    * import {AppDataStore} from 'rainbow-foudation-sdk';
    * import {URLUtil} from 'rainbow-foudation-tools';
    * AjaxUtil.show();
    * const saving_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "APPDATA_API", "SAVE_APPDATA");
    * AppDataStore.saveAppData(saving_url, this.state.appdata, { "method": "POST" }).then((appdata) => {
    *        this.setState({ appdata: appdata});
    *        AjaxUtil.hide();
    * });
    */
    saveAppData(url, appdata) {
        return this.commonPromise(url, appdata, {'method': 'POST'});
    },

    
    commonPromise(url, object, option){
        return new Promise((resolve, reject) => {
            ObjectStore.deleteModelObjectClientProperty(object);
            AjaxUtil.call(url, object, option).then((returnAppdata) => {
                let appdata = returnAppdata;
                if (returnAppdata["Result"]) {
                    appdata = returnAppdata["Result"];
                } 
                this.setAppData(appdata);
                ObjectStore.setModelObjectUUID(appdata);
                resolve(appdata);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },    

    /**
     * load  appdata object.The new appdata will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {AppDataStore} from 'rainbow-foudation-sdk';
     * import {URLUtil} from 'rainbow-foudation-tools';
     * AjaxUtil.show();
     * const load_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "APPDATA_API", "LOAD_APPDATA");
     * AppDataStore.loadAppData(load_url, { "appDataId": this.state.appdata["AppId"] }, null).then((appdata) => {
     *       this.setState({ appdata: appdata});
     *       AjaxUtil.hide();
     * });
     */
    loadAppData(url, object, option) {
        return this.commonPromise(url,object,option);
    },

    /**
    *  get a appdata object from store.
    *  @param  {Number} appId
    *  @example 
    *  import {AppDataStore} from 'rainbow-foudation-sdk';
    *  AppDataStore.getAppData(appId);
    */
    getAppData(key) {
        return ObjectStore.getObject(Constants.SESSION_APPDATA_KEY, key);
    },
    /**
     *  set a appdata object to store.
     *  @param  {Object} appdata  - if policy form back-end
     *  @example 
     *  import {AppDataStore} from 'rainbow-foudation-sdk';
     *  AppDataStore.setAppData(this.state.appdata);
     */
    setAppData(appdata) {
        ObjectStore.setObject(appdata, Constants.SESSION_APPDATA_KEY, "AppId");
    },
    /**
     *  get  child objects of appdata.
     *  @param  {Object} param  
     *  @param  {Object} policy
     *  @example 
     *  import {AppDataStore} from 'rainbow-foudation-sdk';
     *  const param = {
     *       'ModelName': 'AppRiSuggesstion',
     *       'ObjectCode': 'AppRiSuggesstion',
     *   }
     *   AppDataStore.getChild(param, this.state.appdata);
     */
    getChild(param, appdata) {
        return ObjectStore.getChild(param, appdata, Constants.COMMON_CONTEXT_TYPE);
    },
    /**
     *  create a new child object of policy.
     *  @param  {Object} param  
     *  @param  {Object} policy
     *  @example 
     *  import {AppDataStore} from 'rainbow-foudation-sdk';
     *   const param = {
     *       'ModelName': 'AppRiSuggesstion',
     *       'ObjectCode': 'AppRiSuggesstion',
     *   }
     *   const child = AppDataStore.initChild(param);
     *   return child;
     */
    initChild(param) {
        const schema = this.getAppDataSchema();
        return ObjectStore.initChild(param, schema, Constants.COMMON_CONTEXT_TYPE);
    },
    /**
     *  set a child to policy.
     *  @param  {Object} child  
     *  @param  {Object} policy
     *  @param  {Object} param 
     *  @example 
     *  import {AppDataStore} from 'rainbow-foudation-sdk';
     *  const param = {
     *       'ModelName': 'AppRiSuggesstion',
     *       'ObjectCode': 'AppRiSuggesstion',
     *   }
     *   const child = this.initChild(null, param);
     *   child["TempData"]["test"] = "tony";
     *   AppDataStore.setChild(child, this.state.appdata, param);
     */
    setChild(child, appdata, param) {
        const rootSchema = this.getAppDataSchema();
        return ObjectStore.setChild(child, appdata, param, rootSchema, Constants.COMMON_CONTEXT_TYPE);
    },
    /**
    *  delete  child object of policy.
    *  @param  {Object} child  
    *  @param  {Object} policy  
    *  @example 
    *  import {AppDataStore} from 'rainbow-foudation-sdk';
    *  const param = {
    *        'ModelName': 'AppRiSuggesstion',
    *        'ObjectCode': 'AppRiSuggesstion',
    *    }
    *    const child = AppDataStore.getChild(param, this.state.appdata);
    *    AppDataStore.deleteChild(child, this.state.appdata)
    */
    deleteChild(child, appdata) {
        const returnAppdata = ObjectStore.deleteChild(child, appdata);
        this.setAppData(returnAppdata);
        return returnAppdata;
    },
    /**
     * call  api .The new endorsement of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {AppDataStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * const saving_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "APPDATA_API", "SAVE_APPDATA");
     * AppDataStore.call(saving_url, this.state.appdata, { "method": "POST"}).then((appdata) => {
     *       this.setState({appdata:appdata});
     *       AjaxUtil.hide();
     * });
     */
    call(url, object, option) {
        return this.commonPromise(url, object, option);
    }

}
