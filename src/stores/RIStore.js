import ObjectStore from './ObjectStore';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import Constants from '../constants/Constants';
import { ObjectUtil, DateUtil } from 'rainbow-foundation-tools';
import config from 'config';
import { SessionContext } from 'rainbow-foundation-cache';
import SchemaUtil from "../schema/SchemaUtil";
/**
 * @module RIStore
 */
module.exports = {

    /**
     * create a new Treaty object without save to DB .The new Treaty will be flush to the store.
     * @example 
     * import {RIStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * RIStore.initTreaty().then((treaty) => {
     *          console.log(treaty);
     *          this.setState({ treaty: treaty });
     *          AjaxUtil.hide();
     * });
     */
    initTreaty() {
        return new Promise((resolve, reject) => {
            SchemaUtil.loadModelObjectSchema(Constants.RITREATY,Constants.RITREATY_CODE,Constants.COMMON_CONTEXT_TYPE, Constants.COMMON_CONTEXT_TYPE).then((schema) => {
                const treaty = ObjectStore.initModelObject(schema);
                this.setTreaty(treaty);
                resolve(treaty);
            })
        }, function (error) {
            console.error(error);
            reject(error)
        })

    },
    /**
    * save  Treaty object.The new Treaty of back end return will be flush to the store
    * @param  {String} url
    * @param  {Object} treaty
    * @example
    * import {RIStore} from 'rainbow-foudation-sdk';
    * AjaxUtil.show();
    * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',Treaty_API','SAVE_Treaty');
    * RIStore.saveTreaty(url,treaty).then((treaty)=>{
    *       this.setState({treaty:treaty})   
    *       AjaxUtil.hide();
    *       UIMessageHelper.info("保存成功！",null, null);
    * })
    */
    saveTreaty(url, treaty) {
        ObjectStore.deleteModelObjectClientProperty(treaty);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, treaty, { 'method': 'POST' }).then((returnTreaty) => {
                this.setTreaty(returnTreaty["Model"]);
                ObjectStore.setModelObjectUUID(returnTreaty["Model"]);
                resolve(returnTreaty["Model"]);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
     * call  api .The new Treaty of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {RIStore} from 'rainbow-foudation-sdk';
     * import {URLUtil} from 'rainbow-foudation-tools';
     * AjaxUtil.show();
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',Treaty_API','SAVE_Treaty');
     * RIStore.call(url,treaty,{'method':'POST'}).then((treaty)=>{
     *       this.setState({ treaty: treaty });
     *       AjaxUtil.hide();
     *       UIMessageHelper.info("操作成功！",null, null);
     * })
     */
    call(url, treaty, option) {
        ObjectStore.deleteModelObjectClientProperty(treaty);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, treaty, option).then((returnTreaty) => {
                if(returnTreaty[Constants.COMM_TYPE]== `${Constants.RITREATY}-${Constants.RITREATY_CODE}`){
                    this.setTreaty(returnTreaty);
                    ObjectStore.setModelObjectUUID(returnTreaty);
                    resolve(returnTreaty);
                }else{
                    resolve(returnTreaty);
                }
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
     * load  Treaty object.The new Treaty will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {RIStore} from 'rainbow-foudation-sdk';
     * import {URLUtil} from 'rainbow-foudation-tools';
     * AjaxUtil.show();
     * const self = this;
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',Treaty_API','LOAD_Treaty');
     * RIStore.loadTreaty(url,object,option).then((treaty)=>{
     *           this.setState({ treaty: treaty });
     *           self.gotoPath(path);
     * })
     */
    loadTreaty(url,object,option) {
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url,object,option).then((returnTreaty) => {
                SchemaUtil.loadModelObjectSchema(Constants.RITREATY,Constants.RITREATY_CODE,Constants.COMMON_CONTEXT_TYPE, Constants.COMMON_CONTEXT_TYPE).then((schema) => {
                    this.setTreaty(returnTreaty["Model"]);
                    ObjectStore.setModelObjectUUID(returnTreaty["Model"]);
                    resolve(returnTreaty["Model"]);
                })
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
    *  get a Treaty object from store.
    *  @example 
    *  import {RIStore} from 'rainbow-foudation-sdk';
    *  RIStore.getTreaty();
    */
    getTreaty() {
        const treaty = SessionContext.get(`${Constants.SESSION_RITREATY_KEY}${Constants.COMM_CONNECTOR}`);
        return treaty;
    },
   
    /**
     *  set a Treaty object to store.
     *  @param  {Object} Treaty  - if Treaty form back-end
     *  @example 
     * import {URLUtil} from 'rainbow-foudation-tools';
     *  const url = URLUtil.getConfigURL("API_GATEWAY_PROXY","Treaty_API","CALCULATE");
     *  AjaxUtil.call(url,this.state.treaty,{"method":"POST"}).then((returnTreaty)=>{
     *     this.setState({treaty:returnTreaty});
     *     RIStore.setTreaty(returnTreaty);
     *  });
     */
    setTreaty(treaty) {
        ObjectStore.storeModelObject(`${Constants.SESSION_RITREATY_KEY}${Constants.COMM_CONNECTOR}`, treaty);
    },
    /**
     *  get  child objects of Treaty.
     *  @param  {Object} param  - set ModelName and ObjectCode in json object notes: this objectScope is options default is Treaty
     *  @param  {Object} Treaty
     *  @example 
     *  import {RIStore} from 'rainbow-foudation-sdk';
     *  //example1:
     *  const getParam = {
     *  'ModelName':'RiTreatyCommission',
     *  'ObjectCode':'RiTreatyCommission'
     *  };
     *  console.log(RIStore.getChild(param, treaty));
    
     * const PartyAddressParam = {
     *      'ModelName':'RiTreatySection',
     *      'ObjectCode':'RiTreatySection',
     *      'ParentModelName':'RiTreatyRiskCategory',
     *      'ParentObjectCode':'RiTreatyRiskCategory'
     * };
     *  console.log(RIStore.getChild(PartyAddressParam,Treaty));
     */
    getChild(param,treaty) {
        return ObjectStore.getChild(param,treaty,Constants.COMMON_CONTEXT_TYPE);
    },
    /**
     *  create a new child object of Treaty.
     *  @param  {Object} param  - set ModelName and ObjectCode in json object 
     *  @param  {Object} treaty
     *  @example 
     *  import {RIStore} from 'rainbow-foudation-sdk';
     *  //example1:
     *  const getParam = {
     *  'ModelName':'RiTreatyCommission',
     *  'ObjectCode':'RiTreatyCommission'
     *  };
     *  console.log(RIStore.initChild(param, treaty));
     */
    initChild(param,treaty) {
        const schema = this.getTyeatySchema(treaty);
        let rootSchema = SchemaUtil.lookupModelObjectSchema(param,schema)[Constants.PARENT_SCHEMA];
        if(!rootSchema){
            rootSchema = schema;
        }
        return ObjectStore.initChild(param,rootSchema,Constants.COMMON_CONTEXT_TYPE);
    },
    /**
     *  set a child to Treaty.
     *  @param  {Object} child  
     *  @param  {Object} treaty
     *  @param  {Object} param  - set ModelName and ObjectCode in json object 
     *  @example 
     *  import {RIStore} from 'rainbow-foudation-sdk';
     *  //example1:
     *  const getParam = {
     *  'ModelName':'RiTreatyCommission',
     *  'ObjectCode':'RiTreatyCommission'
     *  };
     *   const child = RIStore.initChild(param, treaty);
     *   RIStore.setChild(child, treaty);
     *   console.log(this.state.treaty);
     *  //example2:
     *  const param = {
     *      'ModelName':'RiTreatySection',
     *      'ObjectCode':'RiTreatySection',
     *      'ParentModelName':'RiTreatyRiskCategory',
     *      'ParentObjectCode':'RiTreatyRiskCategory'
     *  }
     *   const child = RIStore.initChild(param, Treaty);
     *   RIStore.setChild(child, treaty,param);
     *   console.log(Treaty);
     */
    setChild(child,treaty,param) {
        const schema = this.getTyeatySchema(treaty);
        let rootSchema = SchemaUtil.lookupModelObjectSchema(param,schema)[Constants.PARENT_SCHEMA];
        if(!rootSchema){
            rootSchema = schema;
        }
        return ObjectStore.setChild(child,treaty,param,rootSchema,Constants.COMMON_CONTEXT_TYPE) ;
    },
    /**
    *  get Treaty Schema.
    *  @param  {Object} treaty  
    *  @example 
    *  import {RIStore} from 'rainbow-foudation-sdk';
    *  console.log(RIStore.getTreatySchema());
    */
    getTyeatySchema(){
      const key = SchemaUtil.getSchemaKey(Constants.RITREATY,Constants.RITREATY_CODE,Constants.COMMON_CONTEXT_TYPE);
      return SessionContext.get(key);
    },
    /**
    *  delete  child object of Treaty.
    *  @param  {Object} child  
    *  @param  {Object} treaty  
    *  @example 
    *  import {RIStore} from 'rainbow-foudation-sdk';
    *  //example1:
     *  const getParam = {
     *  'ModelName':'RiTreatyCommission',
     *  'ObjectCode':'RiTreatyCommission'
     *  };
     *   const child = RIStore.getChild(param, treaty);
     *   RIStore.deleteChild(child, treaty);
     *   console.log(this.state.treaty);
     *  //example2:
     *  const param = {
     *      'ModelName':'RiTreatySection',
     *      'ObjectCode':'RiTreatySection',
     *      'ParentModelName':'RiTreatyRiskCategory',
     *      'ParentObjectCode':'RiTreatyRiskCategory'
     *  }
     *   const child = RIStore.getChild(param, treaty);
     *   RIStore.deleteChild(child, treaty);
     *   console.log(treaty);
    */
    deleteChild(child,treaty) {
        const returnTreaty = ObjectStore.deleteChild(child,treaty);
        this.setTreaty(returnTreaty);
        return returnTreaty;
    },
    /**
    *  get child Schema.
    *  @param  {Object} child  
    *  @param  {Object} policy  
    *  @example 
    *  import {RIStore} from 'rainbow-foudation-sdk';
    *  console.log(RIStore.getChildSchema(child,treaty));
    */
    getChildSchema(child, treaty) {
        const rootSchema = this.getTyeatySchema(treaty);
        if (this.isTreaty(child)) {
            return rootSchema;
        } else {
            const param = ObjectStore.buildPrarm(child);
            const schema = SchemaUtil.lookupModelObjectSchema(param, rootSchema);
            if (schema && schema["CURRENT_SCHEMA"]) {
                return schema["CURRENT_SCHEMA"];
            } else {
                return null;
            }
        }
    },
    /**@ignore
    */
    isTreaty(object) {
        if (object[Constants.COMM_TYPE] && object[Constants.COMM_TYPE] == `${Constants.POLICY}-${Constants.POLICY_CODE}`) {
            return true;
        } else {
            return false;
        }
    }


}
