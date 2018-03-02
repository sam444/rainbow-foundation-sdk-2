const assert = require("assert");
const PolicyStore = require("../stores/PolicyStore");
global.SDK_ENV = {
    API_GATEWAY_PROXY:"test"
}
describe('测试PolicyStore', function(){
	describe('#创建保单', function(){
  		it('创建pv1产品应该返回一个报单对象', function(){
        	// assert.equal(-1, [1,2,3].indexOf(5));
		    PolicyStore.createPolicy({ 'productCode': "PV1", 'productVersion': "1.0" }).then((policy) => {
                console.log(policy);
                this.setState({ policy: policy });
                AjaxUtil.hide();
            });
		})
	})
});