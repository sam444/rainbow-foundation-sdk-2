import ObjectStore from './ObjectStore';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import Constants from '../constants/Constants';
import { ObjectUtil, DateUtil } from 'rainbow-foundation-tools';
import config from 'config';
import { SessionContext } from 'rainbow-foundation-cache';
import SchemaUtil from "../schema/SchemaUtil";
import PolicyStore from "./PolicyStore";

module.exports = {
    /**
     * create a new submission object by type.The new submission will be flush to the store.
     * @param  {String} type  - submission policy's type
     * @example 
     * import {SubmissionStore,PolicyStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * SubmissionStore.initSubmission(SubmissionStore.POLICY_PACKAGE).then((submission) => {
     *        SubmissionStore.saveSubmission(submission).then((returnSubmission) => {
     *            PolicyStore.createPolicy({ 'productCode': "VDFA", 'productVersion': "1.0" }).then((fpiPolicy) => {
     *                PolicyStore.createPolicy({ 'productCode': "VDEA", 'productVersion': "1.0" }).then((pv1Policy) => {
     *                    SubmissionStore.setPolicy(fpiPolicy, returnSubmission);
     *                    SubmissionStore.setPolicy(pv1Policy, returnSubmission, true);
     *                    console.log(returnSubmission);
     *                    this.setState({ submission: returnSubmission });
     *                    AjaxUtil.hide();
     *                });
     *            });
     *        })
     *    })
     */
    initEndoSubmission(type) {
        return new Promise((resolve, reject) => {
            SchemaUtil.loadModelObjectSchema(Constants.ENDORSEMENT_SUBMISSION, Constants.ENDORSEMENT_SUBMISSION, Constants.COMMON_CONTEXT_TYPE, Constants.COMMON_CONTEXT_TYPE).then((submissionSchema) => {
                SchemaUtil.loadModelObjectSchema(Constants.ENDORSEMENT_SUBMISSION_PRODUCT, Constants.ENDORSEMENT_SUBMISSION_PRODUCT, Constants.COMMON_CONTEXT_TYPE, Constants.COMMON_CONTEXT_TYPE).then((submissionProductSchema) => {
                    const submission = ObjectStore.initModelObject(submissionSchema);
                    resolve(submission);
                });                    
            })
        }, function (error) {
            console.error(error);
            reject(error)
        })

    },
   
    /**
    *   get a  Schema from submission.
    *   @param  {Object} object -  submission
    *   @example 
    *    import {SubmissionStore} from 'rainbow-foudation-sdk';
    *    console.log(SubmissionStore.getSubmissionSchema(submission));
    */
    getSubmissionSchema(submission){
        let type = null;
        if(submission["SubmissionType"]==2){
            type = Constants.POLICY_PACKAGE
        }
        if(submission["SubmissionType"]==1){
            type = Constants.COMMERCIAL_SUBMISSION
        }
        const key = SchemaUtil.getSchemaKey(Constants.SUBMISSION,type,Constants.COMMON_CONTEXT_TYPE);
        return SessionContext.get(key);
      },
    /**
    * save  submission object.The new submission of back end return will be flush to the store
    * @param  {String} url
    * @param  {Object} submission
    * @example
    * import {SubmissionStore} from 'rainbow-foudation-sdk';
    * import {URLUtil} from 'rainbow-foudation-tools';
    * AjaxUtil.show();
    * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',SUBMISSION_API','SAVE_SUBMISSION');
    * SubmissionStore.saveSubmission(url,submission).then((submission)=>{
            this.setState({submission:submission});
    *       AjaxUtil.hide();
    *       UIMessageHelper.info("保存成功！",null, null);
    * })
    */
    saveSubmission(url, submission) {
        ObjectStore.deleteModelObjectClientProperty(submission);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, submission, { 'method': 'POST' }).then((returnSubmission) => {
                this.setSubmission(returnSubmission);
                ObjectStore.setModelObjectUUID(returnSubmission);
                resolve(returnSubmission);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
     * call  api .The new submission of back end return will be flush to the store
     * @param  {String} url
     * @param  {Object} object
     * @param  {Object} option
     * @example
     * import {SubmissionStore} from 'rainbow-foudation-sdk';
     * import {URLUtil} from 'rainbow-foudation-tools';
     * AjaxUtil.show();
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',SUBMISSION_API','CALCULATE');
     * SubmissionStore.call(url,submission,{'method':'POST'}).then((submission)=>{
     *       this.setState({submission:submission});
     *       AjaxUtil.hide();
     *       UIMessageHelper.info("操作成功！",null, null);
     * })
     */
    call(url, submission, option) {
        ObjectStore.deleteModelObjectClientProperty(submission);
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url, submission, option).then((object) => {
                if(this.isSubmission(object)){
                    ObjectStore.setModelObjectUUID(object);
                    this.setSubmission(object);
                }
                resolve(object);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
     * load  submission object.The new policy will be flush to the store
     * @param  {String} url
     * @param  {Object} submissionId
     * @param  {Object} option
     * @example
     * import {SubmissionStore} from 'rainbow-foudation-sdk';
     * import {URLUtil} from 'rainbow-foudation-tools';
     * AjaxUtil.show();
     * const self = this;
     * const url = URLUtil.getConfigURL('API_GATEWAY_PROXY',SUBMISSION_API','LOAD_SUBMISSION');
     * SubmissionStore.loadSubmission(url,{"submissionId":11111},null).then((submission)=>{
     *           this.setState({submission:submission});
     * })
     */
    loadSubmission(url,object,option) {
        return new Promise((resolve, reject) => {
            AjaxUtil.call(url,object,option).then((returnSubmission) => {
                SchemaUtil.loadModelObjectSchema(Constants.SUBMISSION, Constants.SUBMISSION, Constants.COMMON_CONTEXT_TYPE, Constants.COMMON_CONTEXT_TYPE).then((schema) => {
                    ObjectStore.setModelObjectUUID(returnSubmission);
                    this.setSubmission(returnSubmission);
                    resolve(returnSubmission);
                })
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
    *  get a submission object from store.
    *  @param  {Number} submissionId
    *  @example 
    *  import {SubmissionStore} from 'rainbow-foudation-sdk';
    *  const submission = SubmissionStore.getSubmission(submissionId);
    */
    getSubmission(key) {
        return ObjectStore.getObject(Constants.SESSION_SUBMISSION_KEY,key);
    },
    /**@ignore
     */
    isSubmission(object){
        if(object[Constants.COMM_TYPE]&&object[Constants.COMM_TYPE]==`${Constants.SUBMISSION}-${Constants.SUBMISSION}`){
            return true;
        }else{
            return false;
        }
    },
    /**
     *  set a submission object to store.
     *  @param  {Object} submission  - if submission form back-end
     *  @example 
     *  AjaxUtil.call(url,this.state.submission,{"method":"POST"}).then((returnSubmission)=>{
     *      this.setState({submission:returnSubmission});
     *      SubmissionStore.setSubmission(returnSubmission);
     *  });
     */
    setSubmission(submission) {
        ObjectStore.setObject(submission,Constants.SESSION_SUBMISSION_KEY,"SubmissionId");
    },
    /**
     *  set a policy object to submission.
     *  @param  {Object} policy 
     *  @param  {Object} submission 
     *  @param  {Boolean} isMain - if the policy is main policy please set true. 
     *  @example 
     *  import {SubmissionStore} from 'rainbow-foudation-sdk';
     *  SubmissionStore.setPolicy(policy, submission, true);//set main policy
     */
    setPolicy(policy,submission,isMain) {
        const key = SchemaUtil.getSchemaKey(Constants.SUBMISSION_PRODUCT,Constants.SUBMISSION_PRODUCT,Constants.COMMON_CONTEXT_TYPE);
        let submissionProductSchema = SessionContext.get(key);
        const submissionProductList = submission["SubmissionProductList"];
        const submissionProduct = ObjectStore.initModelObject(submissionProductSchema);
        submissionProduct["Policy"] = policy;
        submissionProduct["PolicyId"] = policy["PolicyId"];
        submissionProduct["ProductCode"] = policy["ProductCode"];
        if(submissionProductList){
            submission["SubmissionProductList"].push(submissionProduct);
        }else{
            submission["SubmissionProductList"] = [submissionProduct];
        }
        if(isMain){
            submission["MainProductCode"] = policy["ProductCode"];
        }
        return submission;
    },
    /**
     *  get a policy list from submission.
     *  @param  {Object} submission 
     *  @example 
     *  import {SubmissionStore} from 'rainbow-foudation-sdk';
     *  SubmissionStore.getPolicy(submission);
     */
    getPolicy(submission) {
        const param = {'ModelName': PolicyStore.MODEL_NAME,'ObjectCode': PolicyStore.OBJECT_CODE};
        return ObjectStore.getModelObject(param,submission);
    },
   /**
     *  delete a policy object to submission.
     *  @param  {Object} policy 
     *  @param  {Object} submission 
     *  @example 
     *  import {SubmissionStore} from 'rainbow-foudation-sdk';
     *  SubmissionStore.deletePolicy(policy, submission);
     */
    deletePolicy(policy,submission) {
        const returnSubmission = ObjectStore.deleteModelObject(policy,submission);
        const submissionProductList = returnSubmission["SubmissionProductList"];
        if(submissionProductList){
            returnSubmission["SubmissionProductList"] = _.filter(submissionProductList,(submissionProduct)=>{
                return submissionProduct["Policy"]
            });
        }
        return returnSubmission;
    }


}
