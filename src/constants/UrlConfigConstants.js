let API_GATEWAY_PROXY = JSON.parse(sessionStorage.getItem('project_config')).API_GATEWAY_PROXY;

module.exports = {
	API_GATEWAY_PROXY: API_GATEWAY_PROXY,
	DD: {
		product_dd_schema: API_GATEWAY_PROXY + "dd/public/dictionary/mgmt/v1/generateFullUiResourceSchemaWithoutField",
		product_dd_codetable: API_GATEWAY_PROXY + "ui/common/field/codetable/byContextTypeAndReferenceId",
		product_dd_id_codetable: API_GATEWAY_PROXY + "ui/common/codetable/byContextTypeAndReferenceId",
		product_common_codetable: API_GATEWAY_PROXY + "ui/common/codetable/byContextTypeAndReferenceId",
		product_common_id_codetable: API_GATEWAY_PROXY + "ui/common/codetable/byContextTypeAndReferenceId",
		product_dd_big_codetable: API_GATEWAY_PROXY + "ui/common/codetable/version/single"
	},
    PRODUCT_API:{
        GET_PRODUCT_BY_CODE_VERSION:API_GATEWAY_PROXY + "product/prd/v1/getProductIdByCodeAndVersion",
        GET_PRODUCT_BY_EFFORTDATE:API_GATEWAY_PROXY + "product/prd/v1/getEffectiveProductByStartDate",
		GET_PRODUCT_BY_PRODUCT_ID:API_GATEWAY_PROXY +'product/prd/v1/product/',
		LOAD_PRODUCT_BY_ID:API_GATEWAY_PROXY +'product/element/runtime/v1/getElementTreeByProductId',
		LOAD_PRODUCT_ELEMENT_BY_ID:API_GATEWAY_PROXY +'product/mgmt/v1/getProductElement',
		GET_PLAN_BY_PLAN_CODE:API_GATEWAY_PROXY +'product/plan/v1/getPlanDefByCodes',
		GET_FILTER_FORM:API_GATEWAY_PROXY +'product/mgmt/v1/filterChildElement',
    },
    POLICY_API:{
        CREATE_POLICY:API_GATEWAY_PROXY + "public/orchestration/dispatch/newbiz_Quoting",
        FILL_POLICY:API_GATEWAY_PROXY + "pa/pa/policy/v1/fill/policy/product"
    },
    ENDORSEMENT_API:{
        CREATE_ENDORSEMENT:API_GATEWAY_PROXY + "public/orchestration/dispatch/AP00_endo_create",
		SAVE_ENDORSEMENT:API_GATEWAY_PROXY + "public/orchestration/dispatch/AP00_endo_update"
    }
};
