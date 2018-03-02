import ObjectStore from './ObjectStore';
import UrlConfigConstants from '../constants/UrlConfigConstants';
import Constants from '../constants/Constants';
import { ObjectUtil, DateUtil} from 'rainbow-foundation-tools';
import config from 'config';
import { SessionContext } from 'rainbow-foundation-cache';
import SchemaUtil from "../schema/SchemaUtil";
import PolicyStore from "./PolicyStore";
/**
 * @module ProductStore
 */
module.exports = {
    /**
     * get productId by product code and version.
     * @param  {Object} param
     * @example 
     * import {ProductStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     *  ProductStore.getProductId({ 'ProductCode': 'VDEA', 'ProductVersion': '1.0' }).then((productId)=>{
     *      this.setState(productId:productId);
     *      AjaxUtil.hide();
     *  });
     */ 
    getProductId(param) {
        return new Promise((resolve, reject) => {
            const getProductIdUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_CODE_VERSION']}?productCode=${param.productCode?param.productCode:param.ProductCode}&productVersion=${param.productVersion?param.productVersion:"1.0"}`;
            AjaxUtil.call(getProductIdUrl).then((productId) => {
                resolve(productId);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })

    },
    /**
     * get product element information by product element id
     * @param  {Number} productElementId
     * @example
     * import {ProductStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * ProductStore.loadProductElement(200019869).then((productElement) => {
     *       this.setState(productElement:productElement);
     *       AjaxUtil.hide();
     * });
     */
    loadProductElement(productElementId) {
        return new Promise((resolve, reject) => {
            const productElement = SessionContext.get(Constants.PRODUCT_ID+Constants.COMM_CONNECTOR+productElementId);
            if(productElement){
                resolve(productElement);
            }else{
                const url = UrlConfigConstants['PRODUCT_API']['LOAD_PRODUCT_ELEMENT_BY_ID'];
                AjaxUtil.call(url,{"productElementId":productElementId}).then((productElement) => {
                    SessionContext.put(Constants.PRODUCT_ID+Constants.COMM_CONNECTOR+productElement["ProductElement"],productElement);
                    resolve(productElement);
                });
            }
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
     * load  product schema by product id.
     * @param  {Number} productId
     * @example
     * import {ProductStore} from 'rainbow-foudation-sdk';
     * AjaxUtil.show();
     * ProductStore.loadProductSchema(productId).then((product)=>{
     *    this.setState({product:product});
     *    AjaxUtil.hide();
     * });
     */
    loadProductSchema(productId) {
        return new Promise((resolve, reject) => {
            const product = SessionContext.get(`${Constants.DD_SCHEMA_DATA_KEY}${Constants.COMM_CONNECTOR}`+productId);
            if(product){
                resolve(product);
            }else{
                const url = UrlConfigConstants['PRODUCT_API']['LOAD_PRODUCT_BY_ID'];
                AjaxUtil.call(url,{"productId":productId}).then((product) => {
                    SessionContext.put(`${Constants.DD_SCHEMA_DATA_KEY}${Constants.COMM_CONNECTOR}`+product["ProductId"],product,true);
                    resolve(product);
                });
            }
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
    *  get product by product id.
    *  @param  {Number} productId
    *  @example 
    *  import {ProductStore} from 'rainbow-foudation-sdk';
    *  AjaxUtil.show();
    *  ProductStore.getProduct(productId).then((product)=>{
    *            this.setState({product:product});
    *            AjaxUtil.hide();
    *  });
    */
    getProduct(productId) {
        return new Promise((resolve, reject) => {
            const product = SessionContext.get(`${Constants.DD_SCHEMA_DATA_KEY}${Constants.COMM_CONNECTOR}${Constants.PRODUCT}`+productId);
            if(product){
                resolve(product);
            }else{
                const url = UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_PRODUCT_ID']+productId;
                AjaxUtil.call(url).then((product) => {
                    SessionContext.put(`${Constants.DD_SCHEMA_DATA_KEY}${Constants.COMM_CONNECTOR}${Constants.PRODUCT}`+product["ProductId"],product,true);
                    resolve(product);
                });
            }
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
     /**
     * get productId by product code and version.
     * @param  {Object} param
     * @example 
     * import {ProductStore} from 'rainbow-foudation-sdk';
     * import { UrlUtil,DateUtil } from "rainbow-foundation-tools";
     *  AjaxUtil.show();
     *  ProductStore.getProductByDate({ 'ProductCode': 'VDEA', 'StartDate': DateUtil.getCurrentDateTime()}).then((product)=>{
     *      this.setState(product:product);
     *      AjaxUtil.hide();
     *   });
     */ 
    getProductByDate(param) {
        return new Promise((resolve, reject) => {
            const getProductIdUrl = `${UrlConfigConstants['PRODUCT_API']['GET_PRODUCT_BY_EFFORTDATE']}?productCode=${param.productCode?param.productCode:param.ProductCode}&startDate=${param.StartDate?param.StartDate:""}`;
            AjaxUtil.call(getProductIdUrl).then((product) => {
                resolve(product);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
     *  get product element by element name and code.
     *  @param  {Object} param
     *  @example 
     *  import {ProductStore} from 'rainbow-foudation-sdk';
     *  ProductStore.getProductId({ 'ProductCode': 'VDEA', 'ProductVersion': '1.0' }).then((productId)=>{
     *       const param = {
     *           "ModelName": "ProductRisk",
     *           "ObjectCode": "VEHICLE",
     *           "ProductId":productId
     *       }
     *       ProductStore.getProductElement(param).then((productElement) => {
     *           this.setState({productElement:productElement});
     *       });
     *  });
     */
    getProductElement(param) {
        return new Promise((resolve, reject) => {
            this.loadProductSchema(param["ProductId"]).then((schema)=>{
                const returnList = [];
                this._checkProductElement(param,schema,returnList);
                resolve(returnList[0]);
            });
        }, function (error) {
            console.error(error);
            reject(error)
        })
        
    },

    _checkProductElement(param,element,returnList){
        if(`${Constants.PRODUCT_ELEMENT}-${param[Constants.DD_MODEL_NAME]}` == element[Constants.COMM_TYPE] && param[Constants.DD_OBJECT_CODE]==element[Constants.PRODUCT_ELEMENT_CODE]){
            returnList.push(element);
        }else if(element["ChildProductTreeNodeList"]){
            _.each(element["ChildProductTreeNodeList"],(item)=>{
                return this._checkProductElement(param,item,returnList);
            });
        }
    },
    /**
    *  get  forms  of each level.
    *  @param  {Object} param  
    *  @param  {Object} policy  
    *  @example 
    *   import {ProductStore} from 'rainbow-foudation-sdk';
    *   //example1: this example will return define form
    *   const param = {
    *        "ModelName": "PolicyLob",
    *        "ObjectCode": "QYA10_S",
    *        "ProductId": "135328282",
    *   };
    *   ProductStore.getDefineFormList(param).then((forms) => {
    *         console.log(forms);
    *         AjaxUtil.hide();
    *   });
    */
    getDefineFormList(param) {
        return new Promise((resolve, reject) => {
            const key = SchemaUtil.getSchemaKey(Constants.POLICY, Constants.POLICY, param["ProductId"]);
            const schema = SessionContext.get(key);
            const levelSchema = SchemaUtil.lookupModelObjectSchema(param, schema);
            const formParentSchema = levelSchema[Constants.CURRENT_SCHEMA];
            if (!_.isEmpty(formParentSchema)) {
                const elementId = formParentSchema[Constants.ELEMENT_ID]+"|-12,-3";
                const returnFormList = SessionContext.get("Form" + elementId);
                if (returnFormList) {
                    resolve(returnFormList);
                } else {
                    const url = `${UrlConfigConstants['PRODUCT_API']['GET_FILTER_FORM']}`;
                    AjaxUtil.call(url, [elementId], { "method": "POST" }).then((formDefs) => {
                        SessionContext.put("Form" + elementId, formDefs);
                        resolve(formDefs);
                    });
                }

            } else {
                resolve([formTemplate]);
            }
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },
    /**
    *  get  forms  of each level.
    *  @param  {Object} param  
    *  @param  {Object} policy  
    *  @example 
    *  //example2:this example will return define plan
    * const param = {
    *        'PlanCodes': ['VP001'],
    *        "ProductId": "135328282",
    *  }
    *   PolicyStore.initPlan(param).then((plans) => {
    *         console.log(plans);
    *         AjaxUtil.hide();
    *   });
    */
    getDefinePlanList(param) {
        return new Promise((resolve, reject) => {
                const url = `${UrlConfigConstants['PRODUCT_API']['GET_PLAN_BY_PLAN_CODE']}?productId=${param["ProductId"]}`;
                AjaxUtil.call(url, param["PlanCodes"], { "method": "POST" }).then((planctDefs) => {
                    resolve(planctDefs);
                });
        }, function (error) {
            console.error(error);
            reject(error)
        })
    },

}
