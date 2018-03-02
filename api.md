## Modules

<dl>
<dt><a href="#module_PolicyAction">PolicyAction</a></dt>
<dd></dd>
<dt><a href="#module_PolicyStore">PolicyStore</a></dt>
<dd></dd>
</dl>

<a name="module_PolicyAction"></a>

## PolicyAction

* [PolicyAction](#module_PolicyAction)
    * [.createPolicy(productCode, productVersion, effectiveDate, expiryDate, policyType, createPolicyUrl)](#module_PolicyAction.createPolicy) ⇒ <code>Object</code>
    * [.savePolicy(url)](#module_PolicyAction.savePolicy) ⇒ <code>Object</code>
    * [.loadPolicy(url)](#module_PolicyAction.loadPolicy) ⇒ <code>Object</code>

<a name="module_PolicyAction.createPolicy"></a>

### PolicyAction.createPolicy(productCode, productVersion, effectiveDate, expiryDate, policyType, createPolicyUrl) ⇒ <code>Object</code>
create a new policy object by product Code and version.The new state will be flush to the  store.

**Kind**: static method of [<code>PolicyAction</code>](#module_PolicyAction)  
**Returns**: <code>Object</code> - policy  

| Param | Type | Description |
| --- | --- | --- |
| productCode | <code>String</code> |  |
| productVersion | <code>String</code> |  |
| effectiveDate | <code>String</code> | default current Date |
| expiryDate | <code>String</code> | default next year current Date |
| policyType | <code>String</code> | default:single policy |
| createPolicyUrl | <code>String</code> |  |

<a name="module_PolicyAction.savePolicy"></a>

### PolicyAction.savePolicy(url) ⇒ <code>Object</code>
save  policy object.

**Kind**: static method of [<code>PolicyAction</code>](#module_PolicyAction)  
**Returns**: <code>Object</code> - policy  

| Param | Type |
| --- | --- |
| url | <code>String</code> | 

<a name="module_PolicyAction.loadPolicy"></a>

### PolicyAction.loadPolicy(url) ⇒ <code>Object</code>
load  policy object.

**Kind**: static method of [<code>PolicyAction</code>](#module_PolicyAction)  
**Returns**: <code>Object</code> - policy  

| Param | Type |
| --- | --- |
| url | <code>String</code> | 

<a name="module_PolicyStore"></a>

## PolicyStore

* [PolicyStore](#module_PolicyStore)
    * [.getPolicy()](#module_PolicyStore.getPolicy)
    * [.setPolicy(policy)](#module_PolicyStore.setPolicy)
    * [.getObject(param)](#module_PolicyStore.getObject)
    * [.getObjects(param)](#module_PolicyStore.getObjects)
    * [.deleteObject(param)](#module_PolicyStore.deleteObject)

<a name="module_PolicyStore.getPolicy"></a>

### PolicyStore.getPolicy()
get a policy object from store.

**Kind**: static method of [<code>PolicyStore</code>](#module_PolicyStore)  
**Example**  
```js
PolicyStore.getPolicy();
```
<a name="module_PolicyStore.setPolicy"></a>

### PolicyStore.setPolicy(policy)
set a policy object to store.

**Kind**: static method of [<code>PolicyStore</code>](#module_PolicyStore)  

| Param | Type | Description |
| --- | --- | --- |
| policy | <code>Object</code> | this policy form back-end |

**Example**  
```js
const url = this.getURL("POLICY_API","CALCULATE"); AjaxUtil.call(url,this.state.policy,{"method":"POST"}).then((returnPolicy)=>{    PolicyStore.setPolicy(returnPolicy); });
```
<a name="module_PolicyStore.getObject"></a>

### PolicyStore.getObject(param)
get  child objects of policy.

**Kind**: static method of [<code>PolicyStore</code>](#module_PolicyStore)  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>Object</code> | set objectName and objectCode in json object notes: this objectScope is options default is policy |

**Example**  
```js
//example1: const getParam = { 'objectName':'PartyOrgCustomer', 'objectCode':'PartyOrgCustomer' }; PolicyStore.getObject(getParam);  //example2: const param = {  'objectName':'PartyIndividualCustomer',  'objectCode':'PartyIndividualCustomer'};const partyIndividualCustomer = PolicyStore.getObject(param);const PartyAddressParam = {  'objectName':'PartyAddress',  'objectCode':'PartyAddress',  'objectScope':partyIndividualCustomer//default value is policy};const partyAddress = PolicyStore.getObject(PartyAddressParam);
```
<a name="module_PolicyStore.getObjects"></a>

### PolicyStore.getObjects(param)
get  child objects of policy.

**Kind**: static method of [<code>PolicyStore</code>](#module_PolicyStore)  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>Array</code> | set objectName and objectCode in json object notes: this objectScope is options default is policy |

**Example**  
```js
getCoverageList(){ const params = [ {   'objectName':'PolicyCoverage',   'objectCode':'PUBLIC' }, {   'objectName':'PolicyCoverage',   'objectCode':'TPLOSS001' }, {   'objectName':'PolicyCoverage',   'objectCode':'PROPERTY' }, {   'objectName':'PolicyCoverage',   'objectCode':'CASH' }, {   'objectName':'PolicyCoverage',   'objectCode':'CUSTOMER' }  ];  return PolicyStore.getObjects(params);
```
<a name="module_PolicyStore.deleteObject"></a>

### PolicyStore.deleteObject(param)
delete  child object of policy.

**Kind**: static method of [<code>PolicyStore</code>](#module_PolicyStore)  

| Param | Type | Description |
| --- | --- | --- |
| param | <code>Object</code> | set objectName and objectCode in json object |

**Example**  
```js
const deleteParam = { 'objectName':'PartyOrgCustomer', 'objectCode':'PartyOrgCustomer' }; PolicyStore.deleteObject(deleteParam);
```
