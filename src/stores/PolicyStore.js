import ObjectStore from './ObjectStore';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import Constants from '../constants/Constants';
import { ObjectUtil, DateUtil } from 'rainbow-foundation-tools';
import config from 'config';
import { SessionContext } from 'rainbow-foundation-cache';
import SchemaUtil from "../schema/SchemaUtil";
import ProductStore from './ProductStore';

/**
 * @module PolicyStore
 */
module.exports = {

    MODEL_NAME: Constants.POLICY,
    OBJECT_CODE: Constants.POLICY_CODE,
    /**
     * create a new policy object without save to DB by product Code and version.The new policy will be flush to the store.
     * @param  {Object} param  - set productCode,productVersion,effectiveDate,expiryDate,policyType in json object notes: effectiveDate default is current Date and expiryDate default is next year current Date and policyType default is single policy
     * @example 
     * import {PolicyStore} from 'rainbow-foudation-sdk';
     * const param ={
     *       'productCode':'PV1',
     *       'productVersion':'1.0',
     *       'policyType':"1" //1  POLICY 2 MASTERPOLICY 3 GROUPPOLICY 4 CERTIFICATE
     * };
     * AjaxUtil.show();
     * PolicyStore.initPolicy(param).then((policy) => {
     *          console.log(policy);
     *          this.setState({ policy: policy });
     *          AjaxUtil.hide();
     * });
     */
    initPolicy(param) {
        const self = this;
        const getProductIdUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_CODE_VERSION']}?productCode=${param.productCode?param.productCode:param.ProductCode}&productVersion=${param.productVersion?param.productVersion:param.ProductVersion}`;
        const currentDate = new Date();
        const effectiveDate = param.effectiveDate ? DateUtil.formatToSubmitFormater(DateUtil.formatStringToDate(param.effectiveDate, config.DEFAULT_DATETIME_SUBMIT_FORMATER)) : DateUtil.formatToSubmitFormater(currentDate);
        const expiryDate = param.expiryDate ? DateUtil.formatToSubmitFormater(DateUtil.formatStringToDate(param.expiryDate, config.DEFAULT_DATETIME_SUBMIT_FORMATER)) : DateUtil.add(effectiveDate, 1, 'years');
        return new Promise((resolve, reject) => {
            AjaxUtil.call(getProductIdUrl).then((productId) => {
                SchemaUtil.loadModelObjectSchema(Constants.POLICY, Constants.POLICY, productId, Constants.PRODUCT_CONTEXT_TYPE).then((schema) => {
                    const policy = ObjectStore.initModelObject(schema);
                    const productUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_PRODUCT_ID']}` + productId;
                    AjaxUtil.call(productUrl).then((product) => {
                        policy["EffectiveDate"] = policy["EffectiveDate"] ? policy["EffectiveDate"] : effectiveDate;
                        policy["ExpiryDate"] = policy["ExpiryDate"] ? policy["ExpiryDate"] : expiryDate;
                        policy["ProductId"] = productId;
                        policy["ProductCode"] = product["BusinessCode"];
                        policy["PolicyType"] = param.policyType || "1";
                        this.setPolicy(policy);
                        resolve(policy);
                    });
                })
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })

    },
    /**
     * create a new policy object and save to db by product Code and version.The new policy will be flush to the store.
     * @param  {Object} param  - set productCode,productVersion,effectiveDate,expiryDate,policyType in json object notes: effectiveDate default is current Date and expiryDate default is next year current Date and policyType default is single policy
     * @example 
     * import {PolicyStore} from 'rainbow-foudation-sdk';
     * const param ={
     *       'productCode':'PV1',
     *       'productVersion':'1.0',
     *       'create_url':'http://127.0.0.1/pa/create/policy', //this is option
     *       'create_param':{'BusinessObjectId':12345,'@type':'policy-Policy','ProductId':123}  //this is option
     * };
     * AjaxUtil.show();
     * PolicyStore.createPolicy(param).then((policy) => {
     *          console.log(policy);
     *          this.setState({ policy: policy });
     *          AjaxUtil.hide();
     * });
     */
    createPolicy(param) {
        const self = this;
        const getProductIdUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_CODE_VERSION']}?productCode=${param.productCode?param.productCode:param.ProductCode}&productVersion=${param.productVersion?param.productVersion:param.ProductVersion}`;
        const currentDate = new Date();
        const effectiveDate = param.effectiveDate ? DateUtil.formatToSubmitFormater(DateUtil.formatStringToDate(param.effectiveDate, config.DEFAULT_DATETIME_SUBMIT_FORMATER)) : DateUtil.formatToSubmitFormater(currentDate);
        const expiryDate = param.expiryDate ? DateUtil.formatToSubmitFormater(DateUtil.formatStringToDate(param.expiryDate, config.DEFAULT_DATETIME_SUBMIT_FORMATER)) : DateUtil.add(effectiveDate, 1, 'years');
        return new Promise((resolve, reject) => {
            AjaxUtil.call(getProductIdUrl).then((productId) => {
                SchemaUtil.loadModelObjectSchema(Constants.POLICY, Constants.POLICY, productId, Constants.PRODUCT_CONTEXT_TYPE).then((schema) => {
                    const _policy = ObjectStore.initModelObject(schema);
                    let create_url = param["create_url"];
                    let create_param = null;
                    if (create_url) {
                        if (param["create_param"]) {
                            create_param = param["create_param"];
                        } else {
                            create_param = {
                                'BusinessObjectId': _policy[Constants.DD_BUSINESS_OBJECT_ID],
                                '@type': _policy[Constants.COMM_TYPE],
                                'ProductId': productId
                            };
                        }
                    } else {
                        create_url = `${UrlConfigConstants['POLICY_API']['FILL_POLICY']}`;
                        create_param = {
                            'BusinessObjectId': _policy[Constants.DD_BUSINESS_OBJECT_ID],
                            '@type': _policy[Constants.COMM_TYPE],
                            'ProductId': productId
                        };
                    }
                    AjaxUtil.call(create_url, create_param, { "method": "POST" }).then((policy) => {
                        policy["EffectiveDate"] = policy["EffectiveDate"] ? policy["EffectiveDate"] : effectiveDate;
                        policy["ExpiryDate"] = policy["ExpiryDate"] ? policy["ExpiryDate"] : expiryDate;
                        policy["ProductId"] = productId;
                        policy["PolicyType"] = param.policyType || "1";
                        ObjectStore.setModelObjectUUID(policy);
                        this.setPolicy(policy);
                        resolve(policy);
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
    * @param  {Object} policy
    * @example
    * import {PolicyStore} from 'rainbow-foudation-sdk';
    * AjaxUtil.show();
    * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',POLICY_API','SAVE_POLICY');
    * PolicyStore.savePolicy(url,policy).then((policy)=>{
    *       AjaxUtil.hide();
    *       this.setState({ policy: policy });
    *       UIMessageHelper.info("保存成功！",null, null);
    * })
    */
    savePolicy(url, policy) {
        ObjectStore.deleteModelObjectClientProperty(policy);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, policy, { 'method': 'POST' }).then((returnPolicy) => {
                this.setPolicy(returnPolicy);
                ObjectStore.setModelObjectUUID(returnPolicy["Result"]);
                resolve(returnPolicy["Result"]);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
     * call  api .The new policy of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {PolicyStore} from 'rainbow-foudation-sdk';
     * import {URLUtil} from 'rainbow-foudation-tools';
     * AjaxUtil.show();
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',POLICY_API','SAVE_POLICY');
     * PolicyStore.call(url,policy,{'method':'POST'}).then((policy)=>{
     *       AjaxUtil.hide();
     *       this.setState({ policy: policy });
     *       UIMessageHelper.info("操作成功！",null, null);
     * })
     */
    call(url, policy, option) {
        ObjectStore.deleteModelObjectClientProperty(policy);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, policy, option).then((returnPolicy) => {
                this.setPolicy(returnPolicy);
                if (returnPolicy["Result"]) {
                    ObjectStore.setModelObjectUUID(returnPolicy["Result"]);
                    resolve(returnPolicy["Result"]);
                } else if (returnPolicy["@type"] == `${Constants.POLICY}-${Constants.POLICY_CODE}`) {
                    ObjectStore.setModelObjectUUID(returnPolicy);
                    resolve(returnPolicy);
                } else {
                    resolve(returnPolicy);
                }
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
     * load  policy object.The new policy will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {PolicyStore} from 'rainbow-foudation-sdk';
     * import {URLUtil} from 'rainbow-foudation-tools';
     * AjaxUtil.show();
     * const self = this;
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',POLICY_API','LOAD_POLICY');
     * PolicyStore.loadPolicy(url).then((policy)=>{
     *       this.setState({ policy: policy });
     *       self.gotoPath(path);
     * })
     */
    loadPolicy(url, object, option) {
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, object, option).then((returnPolicy) => {
                SchemaUtil.loadModelObjectSchema(Constants.POLICY, Constants.POLICY, returnPolicy["ProductId"], Constants.PRODUCT_CONTEXT_TYPE).then((schema) => {
                    ObjectStore.setModelObjectUUID(returnPolicy);
                    this.setPolicy(returnPolicy);
                    resolve(returnPolicy);
                })
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
     * load  policy object schema.The new schema will be flush to the store
     * @param  {Object} object
     * @example
     * import {PolicyStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * PolicyStore.loadPolicySchema(policy).then((schema)=>{
     *
     * })
     */
    loadPolicySchema(policy) {
        return new Promise((resolve, reject) => {
            SchemaUtil.loadModelObjectSchema(Constants.POLICY, Constants.POLICY, policy["ProductId"], Constants.PRODUCT_CONTEXT_TYPE).then((schema) => {
                resolve(schema);
            })
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

    /**
    *  get a policy object from store.
    *  @param  {Number} policyId
    *  @example 
    *  import {PolicyStore} from 'rainbow-foudation-sdk';
    *  PolicyStore.getPolicy(policyId);
    */
    getPolicy(key) {
        return ObjectStore.getObject(Constants.SESSION_POLICY_KEY, key);
    },
    /**
     *  set a policy object to store.
     *  @param  {Object} policy  - if policy form back-end
     *  @example 
     * import {URLUtil} from 'rainbow-foudation-tools';
     *  const url = URLUtil.getConfigURL("API_GATEWAY_PROXY","POLICY_API","CALCULATE");
     *  AjaxUtil.call(url,this.state.policy,{"method":"POST"}).then((returnPolicy)=>{
     *     this.setState({policy:returnPolicy});
     *     PolicyStore.setPolicy(returnPolicy);
     *  });
     */
    setPolicy(policy) {
        ObjectStore.setObject(policy, Constants.SESSION_POLICY_KEY, "PolicyId");
    },
    /**
     *  get  child objects of policy.
     *  @param  {Object} param  - set ModelName and ObjectCode in json object notes: this objectScope is options default is policy
     *  @param  {Object} policy
     *  @example 
     *  import {PolicyStore} from 'rainbow-foudation-sdk';
     *  //example1:
     *  const getParam = {
     *  'ModelName':'PolicyRisk',
     *  'ObjectCode':'VEHICLE'
     *  };
     *  console.log(PolicyStore.getChild(param, policy));
     *  //example2:  same child object has different  Parent
     * const PartyAddressParam = {
     *      'ModelName':'PartyAddress',
     *      'ObjectCode':'PartyAddress',
     *      'ParentModelName':'PartyIndividualCustomer',
     *      'ParentObjectCode':'PartyIndividualCustomer'
     * };
     *   console.log(PolicyStore.getChild(PartyAddressParam,policy));
     *   //example3: same child object has same Parent
     *   const param = {
     *        'ModelName': 'PartyAddress',
     *        'ObjectCode': 'PartyAddress',
     *        'ParentModelName':'PartyIndividualCustomer',
     *        'ParentObjectCode':'PartyIndividualCustomer',
     *        'uuid': parentObject['TempData']['uuid']
     *    }
     * 
     *    const child = PolicyStore.initChild(param, policy);
     *    PolicyStore.getChild(child, policy,param);
     *    console.log(policy);
     *  //example4: same child object has same Parent but different grandfather
     *   const param = {
     *        'ModelName': 'PartyAddress',
     *        'ObjectCode': 'PartyAddress',
     *        'ParentModelName':'PartyIndividualCustomer',
     *        'ParentObjectCode':'PartyIndividualCustomer',
     *        'ScopeModelName':'PolicyLob',
     *        'ScopeObjectCode':FPI',
     *    }
     * 
     *    const child = PolicyStore.initChild(param, policy);
     *    PolicyStore.getChild(child, policy,param);
     *    console.log(policy);
     */
    getChild(param, policy) {
        return ObjectStore.getChild(param, policy, policy[Constants.PRODUCT_ID]);
    },
    /**
     *  create a new child object of policy.
     *  @param  {Object} param  - set ModelName and ObjectCode in json object notes: this objectScope is options default is policy
     *  @param  {Object} policy
     *  @example 
     *  import {PolicyStore} from 'rainbow-foudation-sdk';
     *  const getParam = {
     *  'ModelName':'PolicyRisk',
     *  'ObjectCode':'VEHICLE'
     *  };
     *  console.log(PolicyStore.initChild(param, policy));
     */
    initChild(param, policy) {
        const schema = this.getPolicySchema(policy);
        let rootSchema = SchemaUtil.lookupModelObjectSchema(param,schema)[Constants.PARENT_SCHEMA];
        if(!rootSchema){
            rootSchema = schema;
        }
        return ObjectStore.initChild(param, rootSchema, policy[Constants.PRODUCT_ID]);
    },
    /**
     *  set a child to policy.
     *  @param  {Object} child  
     *  @param  {Object} policy
     *  @param  {Object} param  - set ModelName and ObjectCode in json object notes: this objectScope is options default is policy
     *  @example 
     *  import {PolicyStore} from 'rainbow-foudation-sdk';
     *  //example1:
     *  const getParam = {
     *  'ModelName':'PolicyRisk',
     *  'ObjectCode':'VEHICLE'
     *  };
     *   const child = PolicyStore.initChild(param, policy);
     *   PolicyStore.setChild(child, policy);
     *   console.log(this.state.policy);
     *  //example2:
     *  const param = {
     *     'ModelName': 'PartyAddress',
     *     'ObjectCode': 'PartyAddress',
     *     'ParentModelName':'PartyIndividualCustomer',
     *     'ParentObjectCode':'PartyIndividualCustomer'
     *  }
     *   const child = PolicyStore.initChild(param, policy);
     *   PolicyStore.setChild(child, policy,param);
     *   console.log(policy);
     *  //example3: more parent object has same  ParentModelName and ParentObjectCode
     *   const param = {
     *        'ModelName': 'PartyAddress',
     *        'ObjectCode': 'PartyAddress',
     *        'ParentModelName':'PartyIndividualCustomer',
     *        'ParentObjectCode':'PartyIndividualCustomer',
     *        'uuid': parentObject['TempData']['uuid']
     *    }
     *    const child = PolicyStore.initChild(param, policy);
     *    PolicyStore.setChild(child, policy,param);
     *    console.log(policy);
     *  //example4: same child object has same Parent but different grandfather
     *   const param = {
     *        'ModelName': 'PartyAddress',
     *        'ObjectCode': 'PartyAddress',
     *        'ParentModelName':'PartyIndividualCustomer',
     *        'ParentObjectCode':'PartyIndividualCustomer',
     *        'ScopeModelName':'PolicyLob',
     *        'ScopeObjectCode':FPI',
     *    }
     * 
     *    const child = PolicyStore.initChild(param, policy);
     *    PolicyStore.setChild(child, policy,param);
     *    console.log(policy);
     */
    setChild(child, policy, param) {
        const schema = this.getPolicySchema(policy);
        let rootSchema = SchemaUtil.lookupModelObjectSchema(param,schema)[Constants.PARENT_SCHEMA];
        if(!rootSchema){
            rootSchema = schema;
        }
        return ObjectStore.setChild(child, policy, param, rootSchema, policy[Constants.PRODUCT_ID]);
    },
    /**
    *  get policy Schema.
    *  @param  {Object} policy  
    *  @example 
    *  import {PolicyStore} from 'rainbow-foudation-sdk';
    *  console.log(PolicyStore.getPolicySchema(policy));
    */
    getPolicySchema(policy) {
        const key = SchemaUtil.getSchemaKey(Constants.POLICY, Constants.POLICY, policy["ProductId"]);
        return SessionContext.get(key);
    },
    /**
    *  delete  child object of policy.
    *  @param  {Object} child  
    *  @param  {Object} policy  
    *  @example 
    *  import {PolicyStore} from 'rainbow-foudation-sdk';
    *  //example1:
     *  const getParam = {
     *  'ModelName':'PolicyRisk',
     *  'ObjectCode':'VEHICLE'
     *  };
     *   const child = PolicyStore.getChild(param, policy);
     *   PolicyStore.deleteChild(child, policy);
     *   console.log(this.state.policy);
     *  //example2:
     *  const param = {
     *     'ModelName': 'PartyAddress',
     *     'ObjectCode': 'PartyAddress',
     *     'ParentModelName':'PartyIndividualCustomer',
     *     'ParentObjectCode':'PartyIndividualCustomer'
     *  }
     *   const child = PolicyStore.getChild(param, policy);
     *   PolicyStore.deleteChild(child, policy);
     *   console.log(policy);
    */
    deleteChild(child, policy) {
        const returnPolicy = ObjectStore.deleteChild(child, policy);
        this.setPolicy(returnPolicy);
        return returnPolicy;
    },
    /**
    *  get child Schema.
    *  @param  {Object} child  
    *  @param  {Object} policy  
    *  @example 
    *  import {PolicyStore} from 'rainbow-foudation-sdk';
    *  console.log(PolicyStore.getChildSchema(child,policy));
    */
    getChildSchema(child, policy) {
        const rootSchema = this.getPolicySchema(policy);
        if (this.isPolicy(child)) {
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
    isPolicy(object) {
        if (object[Constants.COMM_TYPE] && object[Constants.COMM_TYPE] == `${Constants.POLICY}-${Constants.POLICY_CODE}`) {
            return true;
        } else {
            return false;
        }
    },
    /**
    *  init  plan  of risk.
    *  @param  {Object} param  
    *  @param  {Object} policy  
    *  @example 
    *   import {PolicyStore} from 'rainbow-foudation-sdk';
    *   //example1: this example will return empty plan
    *   const param = {
    *        "ModelName": "PolicyPlan",
    *        "ObjectCode": "CommonPlan",
    *        'ParentModelName': 'PolicyRisk',
    *        'ParentObjectCode': 'VEHICLE'
    *   };
    *   PolicyStore.initPlan(param, this.state.policy).then((plans) => {
    *         console.log(plans);
    *         AjaxUtil.hide();
    *   });
     *  //example2:this example will return define plan
     *  const param = {
    *        "ModelName": "PolicyPlan",
    *        "ObjectCode": "CommonPlan",
    *        'ParentModelName': 'PolicyRisk',
    *        'ParentObjectCode': 'VEHICLE',
    *        'PlanCodes': ['VP001']
    *  }
    *   PolicyStore.initPlan(param, this.state.policy).then((plans) => {
    *         console.log(plans);
    *         AjaxUtil.hide();
    *     });
    */
    initPlan(param, policy) {
        return new Promise((resolve, reject) => {
            const schema = this.getPolicySchema(policy);
            param["ProductId"] = policy["ProductId"];
            let rootSchema = SchemaUtil.lookupModelObjectSchema(param,schema)[Constants.PARENT_SCHEMA];
            if(!rootSchema){
                rootSchema = schema;
            }
            const planTemplate = ObjectStore.initChild(param, rootSchema, policy[Constants.PRODUCT_ID]);
            const planTemplateSchema = SchemaUtil.lookupModelObjectSchema(param, schema);
            const TempPolicyCoverageList = [];
            _.each(planTemplateSchema[Constants.CURRENT_SCHEMA][Constants.CHILD_ELEMENTS]["TempPolicyCoverageList"], (ctSchema) => {
                const ct = ObjectStore.initModelObject(ctSchema);
                ct["ProductElementCode"] = ctSchema[Constants.ELEMENT_CODE];
                ct["ProductElementId"] = ctSchema[Constants.ELEMENT_ID];
                if (ctSchema[Constants.CHILD_ELEMENTS]) {
                    const PolicyCoverageList = [];
                    _.each(ctSchema[Constants.CHILD_ELEMENTS]["PolicyCoverageList"], (subCtSchema) => {
                        const subct = ObjectStore.initModelObject(subCtSchema);
                        subct["ProductElementCode"] = subCtSchema[Constants.ELEMENT_CODE];
                        subct["ProductElementId"] = subCtSchema[Constants.ELEMENT_ID];
                        PolicyCoverageList.push(subct);
                    });
                    ct["PolicyCoverageList"] = PolicyCoverageList;
                }
                TempPolicyCoverageList.push(ct);
            });
            planTemplate["TempPolicyCoverageList"] = TempPolicyCoverageList;
            if (!_.isEmpty(param["PlanCodes"])) {
                ProductStore.getDefinePlanList(param).then((planctDefs) => {
                    const planList = [];
                    _.each(planctDefs, (planctDef) => {
                        const clonePlanTemplate = ObjectUtil.clone(planTemplate);
                        this._syncPlan(clonePlanTemplate, planctDef)
                        const defCts = planctDef["PlanCoverageList"];
                        _.each(defCts, (defCt) => {
                            _.each(clonePlanTemplate["TempPolicyCoverageList"], (tempCt) => {
                                // const tempCtCode = ObjectStore.buildPrarm(tempCt);
                                // if (tempCtCode && tempCtCode[Constants.DD_OBJECT_CODE] == defCt["ProductElementCode"]) {
                                //     this._syncPlanCt(tempCt, defCt);
                                // }
                                if (defCt["ChildPlanCoverageList"]) {
                                    _.each(defCt["ChildPlanCoverageList"], (defSubCt) => {
                                        const returnCt = _.find(tempCt["PolicyCoverageList"], (_tempCt) => {
                                            const _tempCtCode = ObjectStore.buildPrarm(_tempCt);
                                            if (_tempCtCode && _tempCtCode[Constants.DD_OBJECT_CODE] == defSubCt["ProductElementCode"]) {
                                                return _tempCt;
                                            }
                                        });
                                        if (returnCt) {
                                            this._syncPlanCt(returnCt, defSubCt);
                                        }
                                    })
                                }
                            });
                        })
                        ObjectStore.setModelObjectUUID(clonePlanTemplate);
                        planList.push(clonePlanTemplate);
                    })
                    planList.sort(function (a, b) {
                        return a.PlanOrder - b.PlanOrder
                    });
                    _.each(planList, (plan) => {
                        delete plan["PlanOrder"]
                    });
                    resolve(planList);
                });
            } else {
                resolve([planTemplate]);
            }
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    _syncPlan(toPlan, fromPlan) {
        toPlan["PlanDefinitionId"] = fromPlan["PlanDefId"];
        toPlan["PlanCode"] = fromPlan["PlanCode"];
        toPlan["PlanOrder"] = fromPlan["PlanOrder"];
    },
    _syncPlanCt(toPlanCt, fromPlanCt) {
        // toPlanCt["PlanCoverageId"] = fromPlanCt["PlanCoverageId"];
        // toPlanCt["ProductElementCode"] = fromPlanCt["ProductElementCode"];
        // toPlanCt["ProductElementId"] = fromPlanCt["ProductElementId"];
        toPlanCt["IsSelectedByDefault"] = fromPlanCt["IsSelectedByDefault"];
        if(fromPlanCt.PlanCoverageFieldList){
            _.each(fromPlanCt.PlanCoverageFieldList,(filed)=>{
                if(filed["DefaultValue"]){
                    toPlanCt[filed["FieldName"]] = filed["DefaultValue"];
                }
            });
        }
    },
    
    /**
    *  init  form  of each level.
    *  @param  {Object} param  
    *  @param  {Object} policy  
    *  @example 
    *  import {PolicyStore} from 'rainbow-foudation-sdk';
    *  const param = {
    *        "ModelName": "PolicyForm",
    *        "ObjectCode": "FORMQYA10_S",
    *        "ParentModelName": "PolicyLob",
    *        "ParentObjectCode": "QYA10_S",
    *  }
    *  PolicyStore.initForm(param, this.state.policy).then((forms) => {
    *         console.log(forms);
    *         AjaxUtil.hide();
    *  });
    *  const param = {
    *        "ModelName": "PolicyForm",
    *        "ObjectCode": "FORMQYA10_S",
    *        "ParentModelName": "PolicyLob",
    *        "ParentObjectCode": "QYA10_S",
    *        'ProductElementCodes':["A00018","F00019"]
    *  }
    *  PolicyStore.initForm(param, this.state.policy).then((forms) => {
    *         console.log(forms);
    *         AjaxUtil.hide();
    *  });
    */
    initForm(param, policy) {
        return new Promise((resolve, reject) => {
            const schema = this.getPolicySchema(policy);
            param["ProductId"] = policy["ProductId"];
            let rootSchema = SchemaUtil.lookupModelObjectSchema(param,schema)[Constants.PARENT_SCHEMA];
            if(!rootSchema){
                rootSchema = schema;
            }
            const formTemplate = ObjectStore.initChild(param, rootSchema, policy[Constants.PRODUCT_ID]);
            ProductStore.getDefineFormList({ "ModelName": param["ParentModelName"], "ObjectCode": param["ParentObjectCode"],"ProductId":param["ProductId"] }).then((formList) => {
                const returnList = [];
                _.each(formList,(form)=>{
                    const _formList = form["ChildElementList"];
                    if (!_.isEmpty(param["ProductElementCodes"])) {
                        _.each(param["ProductElementCodes"], (code) => {
                            const defForm = _.find(_formList, (item) => {
                                return code == item["ProductElementCode"];
                            });
                            if (defForm) {
                                const policyForm = ObjectUtil.clone(formTemplate);
                                this._syncForm(policyForm, defForm);
                                ObjectStore.setModelObjectUUID(policyForm);
                                returnList.push(policyForm);
                            } else {
                                returnList.push([formTemplate]);
                            }
                        });
                    } else {
                        _.each(_formList, (item) => {
                            const policyForm = ObjectUtil.clone(formTemplate);
                            this._syncForm(policyForm, item);
                            ObjectStore.setModelObjectUUID(policyForm);
                            returnList.push(policyForm);
                        });
                    }
                });
                resolve(returnList);

            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    _syncForm(toForm, fromForm) {
        toForm["CustomFormTitle"] = fromForm["ProductElementName"];
        toForm["FormCode"] = fromForm["ProductElementCode"];
        toForm["ProductElementId"] = fromForm["ProductElementId"];
    },
}
