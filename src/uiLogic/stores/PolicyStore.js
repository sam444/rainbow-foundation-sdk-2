import ClassCreater from '../utils/ClassCreater';
import ObjectStore from './ObjectStore';
import UrlConfigConstants from '../../constants/UrlConfigConstants';
import ObjectSchemaActions from '../actions/ObjectSchemaActions';
import ObjectActions from '../actions/ObjectActions';
import ObjectService from '../services/ObjectService';
import Constants from '../../constants/Constants';
import {ObjectUtil} from 'rainbow-foundation-tools';
import { SessionContext } from 'rainbow-foundation-cache';

/**
 * @module PolicyStore
 */
module.exports = {
    /**
     *  get a policy object from store.
     *  @example 
     *  PolicyStore.getPolicy();
     */
    getPolicy(){
       const policy =  ObjectStore.getModelObject();
       if(policy){
            return policy['Model'];
       }else{
            const model = SessionContext.get(Constants.SESSION_POLICY_KEY);
            if (model) {
                this.setPolicy(model);
                return model;
            } else {
                return null;
            }
       }
    },

    /**
     *  set a policy object to store.
     *  @param  {Object} policy  - this policy form back-end
     *  @example 
     *  const url = this.getURL("POLICY_API","CALCULATE");
     *  AjaxUtil.call(url,this.state.policy,{"method":"POST"}).then((returnPolicy)=>{
     *     PolicyStore.setPolicy(returnPolicy);
     *  });
     */
    setPolicy(policy){
        const _policy = ObjectStore.setModelObject(policy);
        SessionContext.put(Constants.SESSION_POLICY_KEY,_policy,true);
        return _policy;
    },
      /**
     *  get  child objects of policy.
     *  @param  {Object} param  - set objectName and objectCode in json object notes: this objectScope is options default is policy
     *  @example 
     *  //example1:
     *  const getParam = {
     *  'objectName':'PartyOrgCustomer',
     *  'objectCode':'PartyOrgCustomer'
     *  };
     *  PolicyStore.getObject(getParam);
     *  
     *  //example2:
     *  const param = {
     *   'objectName':'PartyIndividualCustomer',
     *   'objectCode':'PartyIndividualCustomer'
     * };
     * const partyIndividualCustomer = PolicyStore.getObject(param);
     *
     * const PartyAddressParam = {
     *   'objectName':'PartyAddress',
     *   'objectCode':'PartyAddress',
     *   'objectScope':partyIndividualCustomer//default value is policy
     * };
     * const partyAddress = PolicyStore.getObject(PartyAddressParam);
     */
    getObject(param){
        return  this.getDomainObjectByModelAndCodeAlwaysInComponentState(param);

    },
    /**
     *  get  child objects of policy.
     *  @param  {Array} param  - set objectName and objectCode in json object notes: this objectScope is options default is policy
     *  @example 
    *  getCoverageList(){
    *  const params = [
    *  {
    *    'objectName':'PolicyCoverage',
    *    'objectCode':'PUBLIC'
    *  },
    *  {
    *    'objectName':'PolicyCoverage',
    *    'objectCode':'TPLOSS001'
    *  },
    *  {
    *    'objectName':'PolicyCoverage',
    *    'objectCode':'PROPERTY'
    *  },
    *  {
    *    'objectName':'PolicyCoverage',
    *    'objectCode':'CASH'
    *  },
    *  {
    *    'objectName':'PolicyCoverage',
    *    'objectCode':'CUSTOMER'
    *  }
    *   ];
    *   return PolicyStore.getObjects(params);
     */
    getObjects(params){
            const childObjects = [];
            params.forEach((param) => {
                const childObject = this.getDomainObjectByModelAndCodeAlwaysInComponentState(param);
                childObjects.push(childObject);
            })
            return childObjects;
    },

     /**
     *  delete  child object of policy.
     *  @param  {Object} param  - set objectName and objectCode in json object
     *  @example 
     *  const deleteParam = {
     *  'objectName':'PartyOrgCustomer',
     *  'objectCode':'PartyOrgCustomer'
     *  };
     *  PolicyStore.deleteObject(deleteParam);
     */
    deleteObject(param){
        const policy = this.getPolicy();
        const targetBusinessObject = this.getDomainObjectByModelAndCodeAlwaysInComponentState(param);
        ObjectStore.deleteDomainObject(targetBusinessObject,policy,policy);
        return policy;       
    },

    getDomainObjectByModelAndCodeAlwaysInComponentState(param){
        let scope = param['objectScope'];
        let scopeName = null;
        let scopeCode = null;
        if(!scope){
            scope = ObjectStore.getModelObject()['Model'];
            scopeName = "Policy";
            scopeCode = "POLICY";
        }else{
            const temp = scope["@type"].split("-");
            scopeName = temp[0];
            scopeCode = temp[1];
        }
        return  ObjectStore.getDomainObjectByModelAndCodeAlwaysInComponentState(param['objectName'],param['objectCode'],scope,scopeName,scopeCode);
    }


}

