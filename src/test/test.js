import { UICard, UICell, UICardGroup, UIBox, UIButton, UIPage } from "rainbowui-core";
import Component from "../../components/Component";
import { UrlUtil } from "rainbow-foundation-tools";
import { PolicyStore, SubmissionStore } from 'rainbow-foundation-sdk';
import config from "config";
import Menu from "../../components/Menu";

export default class Product extends Component {
    constructor(props) {
        super(props);
        this.state = {
            submission: {},
            policy: {}
        };
    }
    render() {
        return (
            <UIPage>
                <Menu />
                <UICard title="Rainbow SDK For Submission" width={this.props.width} collapseIcon="false">
                    <UICell type="row">
                        <UIBox direction="left" padding="25px 0 0 0">
                            <UIButton value="createSubmission" onClick={this.createSubmission.bind(this)} />
                            <UIButton value="getPolicy" onClick={this.getSubmissionPolicy.bind(this)} />
                            <UIButton value="setPolicy" onClick={this.setSubmissionPolicy.bind(this)} />
                            <UIButton value="deletePolicy" onClick={this.deleteSubmissionPolicy.bind(this)} />
                            <UIButton value="saveSubmission" onClick={this.saveSubmission.bind(this)} />
                            <UIButton value="loadSubmission" onClick={this.loadSubmission.bind(this)} />
                            <UIButton value="setSubmission" onClick={this.setSubmission.bind(this)} />
                            <UIButton value="getSubmission" onClick={this.getSubmission.bind(this)} />
                        </UIBox>
                    </UICell>
                    <UICell type="row">
                        <UIBox direction="left" padding="25px 0 0 0">
                            <UIButton value="call" onClick={this.submissionCall.bind(this)} />
                            <UIButton value="getSchema" onClick={this.getSubmissionSchema.bind(this)} />
                        </UIBox>
                    </UICell>

                </UICard>
                <UICard title="Rainbow SDK For Policy" width={this.props.width} collapseIcon="false">

                    <UICell type="row">
                        <UIBox direction="left" padding="25px 0 0 0">
                            <UIButton value="createPolicy" onClick={this.createPolicy.bind(this)} />
                            <UIButton value="savePolicy" onClick={this.savePolicy.bind(this)} />
                            <UIButton value="loadPolicy" onClick={this.loadPolicy.bind(this)} />
                            <UIButton value="setPolicy" onClick={this.setPolicy.bind(this)} />
                            <UIButton value="getPolicy" onClick={this.getPolicy.bind(this)} />
                            <UIButton value="createChild" onClick={this.createChild.bind(this)} />
                            <UIButton value="getChild" onClick={this.getChild.bind(this)} />
                            <UIButton value="setChild" onClick={this.setChild.bind(this)} />
                            <UIButton value="deleteChild" onClick={this.deleteChild.bind(this)} />

                        </UIBox>
                    </UICell>
                    <UICell type="row">
                        <UIBox direction="left" padding="25px 0 0 0">
                            <UIButton value="call" onClick={this.policyCall.bind(this)} />
                            <UIButton value="getSchema" onClick={this.getPolicySchema.bind(this)} />

                        </UIBox>
                    </UICell>
                </UICard>
                <UICard title="Rainbow SDK For Endorsement" width={this.props.width} collapseIcon="false">
                    <UIBox direction="center" padding="25px 0 0 0">
                        <UIButton value="createEndorsement" onClick={this.createSubmission.bind(this)} />
                        <UIButton value="saveEndorsement" onClick={this.savePolicy.bind(this)} />
                        <UIButton value="loadEndorsement" onClick={this.loadPolicy.bind(this)} />
                    </UIBox>
                </UICard>
                <UICard title="Rainbow SDK For RI" width={this.props.width} collapseIcon="false">
                    <UIBox direction="center" padding="25px 0 0 0">
                    </UIBox>
                </UICard>
                <UICard title="Rainbow SDK For Claim" width={this.props.width} collapseIcon="false">
                    <UIBox direction="center" padding="25px 0 0 0">
                    </UIBox>
                </UICard>
                <UICard title="Rainbow SDK For BCP" width={this.props.width} collapseIcon="false">
                    <UIBox direction="center" padding="25px 0 0 0">
                    </UIBox>
                </UICard>
            </UIPage>
        );
    }

   

    submissionCall() {
        const saving_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "SUBMISSION_API", "SAVE_SUBMISSION");
        SubmissionStore.call(saving_url, this.state.submission, { "method": "POST" }).then((object) => {
            console.log(object)
        });
    }


    createSubmission() {
        AjaxUtil.show();
        SubmissionStore.createSubmission(SubmissionStore.POLICY_PACKAGE).then((submission) => {
            SubmissionStore.saveSubmission(submission).then((returnSubmission) => {
                PolicyStore.createPolicy({ 'productCode': "VDFA", 'productVersion': "1.0" }).then((fpiPolicy) => {
                    PolicyStore.createPolicy({ 'productCode': "VDEA", 'productVersion': "1.0" }).then((pv1Policy) => {
                        SubmissionStore.setPolicy(fpiPolicy, returnSubmission);
                        SubmissionStore.setPolicy(pv1Policy, returnSubmission, true);
                        console.log(returnSubmission);
                        this.setState({ submission: returnSubmission });
                        AjaxUtil.hide();
                    });
                });
            })
        })
    }

    setSubmissionPolicy() {
        AjaxUtil.show();
        PolicyStore.createPolicy({ 'productCode': "PV1", 'productVersion': "1.0" }).then((pv1Policy) => {
            SubmissionStore.setPolicy(pv1Policy, this.state.submission);
            console.log(this.state.submission);
            AjaxUtil.hide();
        });
    }

    saveSubmission() {
        AjaxUtil.show();
        const saving_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "SUBMISSION_API", "SAVE_SUBMISSION");
        SubmissionStore.saveSubmission(saving_url, this.state.submission, { "method": "POST" }).then((submission) => {
            this.setState({ submission: submission });
            console.log(submission);
            AjaxUtil.hide();
        });

    }

    loadSubmission() {
        AjaxUtil.show();
        const load_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "SUBMISSION_API", "LOAD_SUBMISSION");
        SubmissionStore.loadSubmission(load_url, { "submissionId": this.state.submission["SubmissionId"] }, null).then((submission) => {
            this.setState({ submission: submission });
            console.log(submission);
            AjaxUtil.hide();
        });
    }

    getSubmission() {
        console.log(SubmissionStore.getSubmission(this.state.submission["SubmissionId"]));
    }

    setSubmission() {
        SubmissionStore.setSubmission(this.state.submission);
        console.log(this.state.submission)
    }


    getSubmissionPolicy() {
        const policy = SubmissionStore.getPolicy(this.state.submission);
        console.log(policy);
    }

    deleteSubmissionPolicy() {
        const policy = SubmissionStore.getPolicy(this.state.submission);
        if (policy) {
            SubmissionStore.deletePolicy(_.isArray(policy) ? policy[0] : policy, this.state.submission);
        }
        console.log(this.state.submission);
    }

    createPolicy() {
        AjaxUtil.show();
        PolicyStore.createPolicy({ 'productCode': "PV1", 'productVersion': "1.0" }).then((policy) => {
            console.log(policy);
            this.setState({ policy: policy });
            AjaxUtil.hide();
        });
    }

    savePolicy() {
        AjaxUtil.show();
        const saving_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "POLICY_API", "SAVE_POLICY");
        PolicyStore.savePolicy(saving_url, this.state.policy, { "method": "POST" }).then((policy) => {
            console.log(policy);
            this.setState({ policy: policy });
            AjaxUtil.hide();
        });
    }

    loadPolicy() {
        AjaxUtil.show();
        const load_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "POLICY_API", "LOAD_POLICY");
        PolicyStore.loadPolicy(load_url + this.state.policy["PolicyId"]).then((policy) => {
            console.log(policy);
            this.setState({ policy: policy });
            AjaxUtil.hide();
        });
    }

    setPolicy() {
        PolicyStore.setPolicy(this.state.policy);
        console.log(this.state.policy);

    }

    getPolicy() {
        console.log(PolicyStore.getPolicy(this.state.policy["PolicyId"]));
    }

    setChild() {
        const param = {
            'ModelName': 'PolicyRisk',
            'ObjectCode': 'VEHICLE',
        }
        // const param = {
        //     'ModelName': 'PartyAddress',
        //     'ObjectCode': 'PartyAddress',
        //     'ParentModelName':'PartyIndividualCustomer',
        //     'ParentObjectCode':'PartyIndividualCustomer'
        // }
        const child = PolicyStore.createChild(param, this.state.policy);
        child["TempData"]["test"]="tony";
        PolicyStore.setChild(child, this.state.policy,param);
        console.log(this.state.policy);
        
    }

    createChild(){
        const param = {
            'ModelName': 'PolicyRisk',
            'ObjectCode': 'VEHICLE',
        }
        // const param = {
        //     'ModelName': 'PartyAddress',
        //     'ObjectCode': 'PartyAddress',
        //     'ParentModelName':'PartyIndividualCustomer',
        //     'ParentObjectCode':'PartyIndividualCustomer'
        // }
        console.log(PolicyStore.createChild(param, this.state.policy));
    }

    getChild() {
        const param = {
            'ModelName': 'PolicyRisk',
            'ObjectCode': 'VEHICLE',
        }
        // const param = {
        //     'ModelName': 'PartyAddress',
        //     'ObjectCode': 'PartyAddress',
        //     'ParentModelName':'PartyIndividualCustomer',
        //     'ParentObjectCode':'PartyIndividualCustomer'
        // }
        console.log(PolicyStore.getChild(param, this.state.policy));
    }

    deleteChild(){
        const param = {
            'ModelName': 'PolicyRisk',
            'ObjectCode': 'VEHICLE',
        }
        // const param = {
        //     'ModelName': 'PartyAddress',
        //     'ObjectCode': 'PartyAddress',
        //     'ParentModelName':'PartyIndividualCustomer',
        //     'ParentObjectCode':'PartyIndividualCustomer'
        // }
        const child = PolicyStore.getChild(param, this.state.policy);
        PolicyStore.deleteChild(child, this.state.policy)
        console.log(this.state.policy)
    }

    policyCall(){
        AjaxUtil.show();
        const saving_url = UrlUtil.getConfigUrl("API_GATEWAY_PROXY", "POLICY_API", "SAVE_POLICY");
        PolicyStore.call(saving_url, this.state.policy, { "method": "POST" }).then((policy) => {
            console.log(policy);
            this.setState({ policy: policy });
            AjaxUtil.hide();
        });
    }

    getPolicySchema(){
        console.log(PolicyStore.getPolicySchema(this.state.policy));
    }

    getSubmissionSchema(){
        console.log(SubmissionStore.getSubmissionSchema(this.state.submission));
    }

}
