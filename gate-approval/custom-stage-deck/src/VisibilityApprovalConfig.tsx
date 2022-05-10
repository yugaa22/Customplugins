import React, { useEffect, useState } from 'react';
import {
  ExecutionDetailsSection,
  ExecutionDetailsTasks,
  FormikFormField,
  FormikStageConfig,
  FormValidator,
  IFormInputProps,
  HelpContentsRegistry,
  HelpField,
  IExecutionDetailsSectionProps,
  IStage,
  TextInput,
  RadioButtonInput,
  DayPickerInput,
  IStageConfigProps,
  IStageTypeConfig,
  NumberInput,
  Validators,
  LayoutProvider,
  StandardFieldLayout,
  IFormikStageConfigInjectedProps,
  IStageForSpelPreview,
  ReactSelectInput,
  useData,
  REST,
} from '@spinnaker/core';
import './VisibilityApproval.less';
import { EvaluateVariablesStageForm } from './input/dynamicFormFields';
import { MultiSelect } from 'react-multi-select-component';

const HorizontalRule = () => (
  <div className="grid-span-4">
    <hr />
  </div>
);

export function VisibilityApprovalConfig(props: IStageConfigProps) {
  const exceptionDiv = (
    <div className="alert alert-danger">
      <div>
        <h5>Exception </h5>
        <div className="Markdown break-word">
          <p>Parameters is undefined</p>
        </div>
      </div>
    </div>
  );

  console.log("Main Return", props);


  //Load Initial Values
  const [parametersPresent, setParametersPresent] = useState(false);

    useEffect(()=> {  
    if(!props.stage.hasOwnProperty('parameters')){
      console.log("First Call");
      
      props.stage.parameters = {}
    }
    
    if(!props.stage.parameters.hasOwnProperty('environment')){
      props.stage.parameters.environment = [{
      "id": null,
      "spinnakerEnvironment": ""
    }]
    }
    
    if(!props.stage.parameters.hasOwnProperty('approvalGroups')){
      props.stage.parameters.approvalGroups = []
    }



    REST(`platformservice/v2/applications/name/${props.application['applicationName']}`).
    get()
    .then(
      (application)=> {
      props.stage.applicationId = JSON.parse(application.applicationId);

        REST(`platformservice/v4/applications/${props.stage.applicationId}`).
        get()
        .then(
          (results)=> {
            getServicePipelineDetails(results);       
          }     
        )
      }     
    )
    setParametersPresent(true);


    console.log("Props: ", props);

  }, []);


  const getGateSecurityParams = () => {
    if(!props.stage?.parameters.hasOwnProperty('gateSecurity')){
      props.stage.parameters.gateSecurity = [
      {
        "connectorType": "PayloadConstraints",
        "helpText": "Payload Constraints",
        "isMultiSupported": true,
        "label": "Payload Constraints",
        "selectInput": false,
        "supportedParams": [
          {
            "helpText": "Key",
            "label": "Key",
            "name": "label",
            "type": "string"
          },
          {
            "helpText": "Value",
            "label": "Value",
            "name": "value",
            "type": "string"
          }
        ],
        "values": [
          {
            "label": "",
            "value": ""
          }
        ]
      }
    ]
    }
  }

    // Environments
    const[environmentsList , setenvironmentsList] = useState([]);
    useEffect(()=> {  
      console.log("Environment API Called");

    REST('oes/accountsConfig/spinnaker/environments').
    get()
    .then(
      (results)=> {
        console.log("Environemnt results: ", results);
        
        setenvironmentsList(results);       
      }     
    )
  }, []) 

    //Add Serivce and Pipeline Details to the JSON
  const getServicePipelineDetails = (data: any) =>{
      console.log("Fourth Call - getting Service Pipeline Details");

    const pipelineName = props.pipeline.name;
    const index = data.services.findIndex((service:any) => service.serviceName == pipelineName);
    if(index >= 0){
      props.stage.serviceId = data.services[index].serviceId;
      const pipelines =  data.services[index].pipelines;
      const pipelineIndex = pipelines.findIndex((pipeline:any) => pipeline.pipelineName == pipelineName);
      if(pipelineIndex >= 0){
        props.stage.pipelineId = pipelines[pipelineIndex].pipelineId;
      }
    }
  }




  
  // const { result: environmentsList} = useData(
  //   () => IgorService.getEnvironments().then(() => {
  //     return [{"id":1,"spinnakerEnvironment":"qa"},{"id":2,"spinnakerEnvironment":"QA"},{"id":3,"spinnakerEnvironment":"prod"}]
  //   }),
  //   [],
  //   [],
  // );

  const handleOnEnvironmentSelect = (e:any, props:any) => {
      console.log("Loaded handleOnEnvironmentSelect", props);

    const index = e.target.value;
    const spinnValue = environmentsList.filter(e => e.id == index)[0].spinnakerEnvironment;
          props.formik.setFieldValue("parameters.environment[0]['id']", index);
          props.formik.setFieldValue("parameters.environment[0]['spinnakerEnvironment']", spinnValue);;

                console.log("After update", props);

  }


    //Automated Approval

    const[policyList , setpolicyList] = useState([]);
    useEffect(()=> {  
    REST('oes/v2/policy/users/user2/runtime?permissionId=read').
    get()
    .then(
      (results)=> {
        setpolicyList(results);       
      }     
    )
  }, []) 
  // const { result: policyList} = useData(
  //   () => IgorService.getPolicyList(), [], []
  // )


  // Approval Groups
  const [approvalGroupsList , setapprovalGroupsList] = useState([]);
  useEffect(()=> {  
    REST('platformservice/v2/usergroups').
    get()
    .then(
      (results)=> {
        setapprovalGroupsList(results);       
      }     
    )
  }, []) 

  const handleApprovalGroups = (e:any, props:any) => {
    console.log("handle Approval Groups: ", props);
    console.log("e Value: ", e);
    
    props.formik.setFieldValue(`parameters.approvalGroups`, e)
  }
  
  // const [checked, setChecked] = useState(false);

  const handleCheckbox = (e:any, props: any) => { 
    // setChecked(e.target.checked);    
    props.formik.setFieldValue('parameters.isAutomatedApproval', e.target.checked)
    console.log('FormikValues: ', props.formik.values);     
  }; 

  const singleFieldComponent = (fieldParams: any) => {

    fieldParams = props.stage.parameters ?? null
    if(!fieldParams && (fieldParams.connectors)){
      return;
    }
    return fieldParams.connectors.map((dynamicField: any, index: number) => {
      if (dynamicField.supportedParams.length < 2 && !dynamicField.isMultiSupported) {
        HelpContentsRegistry.register(
          'approval' + dynamicField.connectorType + dynamicField.supportedParams[0].name,
          dynamicField.supportedParams[0].helpText,
        );
        return (
          <div className="grid-span-2">
            <FormikFormField
              name={`parameters.connectors[${index}].values[0].${dynamicField.supportedParams[0].name}`}
              label={dynamicField.connectorType + ' ' + dynamicField.supportedParams[0].label}
              help={<HelpField id={'approval' + dynamicField.connectorType + dynamicField.supportedParams[0].name} />}
              input={(props) => <TextInput {...props} />}
            />
          </div>
        );
      } else {
        return null;
      }
    });
  };

  const [chosenStage] = React.useState({} as IStageForSpelPreview);

  const multiFieldComp = (props: any) => {
    console.log("Loaded multiFieldComp", props);

    const fieldParams = props.formik.values.parameters ?? null
    if(!(fieldParams && fieldParams.connectors)){
      return;
    }
    return fieldParams.connectors.map((dynamicField: any, index: number) => {
      if (
        (dynamicField.supportedParams.length > 0 && dynamicField.isMultiSupported) ||
        dynamicField.supportedParams.length > 1
      ) {
        HelpContentsRegistry.register('approval' + dynamicField.connectorType, dynamicField.helpText);
        return (
          <div className="grid-span-4 fullWidthContainer">
            <FormikFormField
              name={dynamicField.connectorType}
              label={dynamicField.connectorType}
              help={<HelpField id={'approval' + dynamicField.connectorType} />}
              input={() => (
                <LayoutProvider value={StandardFieldLayout}>
                  <div className="flex-container-v margin-between-lg dynamicFieldSection">
                    <EvaluateVariablesStageForm
                      blockLabel={dynamicField.connectorType}
                      chosenStage={chosenStage}
                      headers={dynamicField.supportedParams}
                      isMultiSupported={dynamicField.isMultiSupported}
                      fieldMapName = "connectors"
                      parentIndex={index}
                      {...props}
                    />
                  </div>
                </LayoutProvider>
              )}
            />
          </div>
        );
      } else {
        return null;
      }
    });
  };

  const renderComponent = (props: IFormikStageConfigInjectedProps) => {
              console.log("Third Call");
              const propsFormik = props.formik.values;

              if(!propsFormik?.parameters){
                console.log("Props parameters not present", props);
                
                return;
              }
                console.log("Props present ---", props);

    // let renderContent = null;
    // const fieldParams = propsFormik?.parameters ?? null;
    // if (fieldParams !== null) {
      // renderContent = (
        return <>

            <div className="grid-span-2 fullWidthContainer">

               <FormikFormField
                // name={props.stage.parameters.environment[0].spinnakerEnvironment}
                name="parameters.environment[0]"
                label="Environment"
                input={() => (
                  <ReactSelectInput
                  {...props}
                  clearable={false}
                  // value={`parameters.environment[0]['id]`}
                  onChange={(e) => {handleOnEnvironmentSelect(e, props)}}
                  // onChange={(o: React.ChangeEvent<HTMLSelectElement>) => {
                  //   this.props.formik.setFieldValue('parameters.connectorType', o.target.value);
                  // }}
                  // stringOptions={connectorAccountList.map((e) => e.label)} 
                  options={environmentsList.map((item:any) => (
                    {
                        value: item.id,
                        label: item.spinnakerEnvironment
                      }))}
                  //value={...props}
                  value={propsFormik?.parameters.environment[0].id}
                  // stringOptions={...props}
                  />
                )}
              />       

            </div>

            {/* Automated Approval */}

            <div className="grid-span-2 fullWidthContainer">
              <input type="checkbox" checked={propsFormik?.parameters?.isAutomatedApproval} onChange={(e) => handleCheckbox(e, props)}  /> Automated Approval

               {propsFormik?.parameters?.isAutomatedApproval ? 
              <div className="grid grid-4">
                
                <div className="grid-span-1">              
                  <FormikFormField
                    name="parameters.automatedApproval[0].policyId"
                    label="Automated Approval"
                    input={(props) => (
                      <ReactSelectInput
                      {...props}
                      clearable={false}
                      // onChange={(o: React.ChangeEvent<HTMLSelectElement>) => {
                      //   this.props.formik.setFieldValue('parameters.connectorType', o.target.value);
                      // }}
                      options={policyList && policyList.map((policy: any) => ({
                        label: policy.policyName,
                        value: policy.policyId
                      }))} 
                      //value={...props}
                      //stringOptions={...props}
                      />
                    )}
                  />       
                </div>

              </div>
            : null}

            </div>


            <div className="grid-span-1">
              <p>Approval Groups</p> 
              <MultiSelect
                options = {approvalGroupsList && approvalGroupsList.map((approvalGroup: any) => ({
                            label: approvalGroup.userGroupName,
                            value: approvalGroup.userGroupId
                          }))} 
                onChange={(e:any) => handleApprovalGroups(e,props)}
                labelledBy="Select"
                value={propsFormik?.parameters?.approvalGroups}
              /> 
            </div>

          {/* <div className="grid-span-4 fullWidthContainer">
            <FormikFormField
              name="parameters.gateUrl"
              label="Gate Url"
              help={<HelpField id="opsmx.approval.gateUrl" />}
              input={(props) => <TextInput className="fullWidthField" {...props} />}
            />
          </div> */}
          {/* {singleFieldComponent(fieldParams)}*/}
          {multiFieldComp({ ...props })} 

          {/* <div className="grid-span-4 fullWidthContainer">
            <FormikFormField
              name="parameters.imageIds"
              label="Image Ids"
              help={<HelpField id="opsmx.approval.imageIds" />}
              input={(props) => <TextInput className="fullWidthField" {...props} />}
            />
          </div> */}

          <div className='p-4'>
              <div className="grid-span-4">
                <h4>Gate Security</h4>
                <br />
                <div className="grid-span-2">
                  {/* {propsFormik.gateUrl} */}
                </div>
                {multiFieldGateSecurityComp({ ...props })}
              </div>
        </div>
        </>
      // );
    // } else {
    //   renderContent = exceptionDiv;
    // }
    // return renderContent;
  };


// Gate Security

  // const fieldParams = { "connectors": [{ "connectorType": "PayloadConstraints", "helpText": "Payload Constraints", "isMultiSupported": true, "label": "Payload Constraints", "supportedParams": [{ "helpText": "Key", "label": "Key", "name": "label", "type": "string" }, { "helpText": "Value", "label": "Value", "name": "value", "type": "string" }], "values": [{ "label": "${bn}", "value": "Dev-run-tests-on-staging-master" }] }], "gateUrl": "https://isd.prod.opsmx.net/gate/visibilityservice/v5/approvalGates/3/trigger", "imageIds": "opsmx:latest" }
  
  const multiFieldGateSecurityComp = (props: any) => {
    getGateSecurityParams();
              console.log("Loaded multiFieldGateSecurityComp", props);


    const fieldParams = props.formik.values?.parameters ?? null
    if(!(fieldParams && fieldParams.gateSecurity)){
      return;
    }
    // const fieldParams = props.stage.parameters ?? null
    return fieldParams.gateSecurity.map((dynamicField: any, index: number) => {
      if (
        (dynamicField.supportedParams.length > 0 && dynamicField.isMultiSupported) ||
        dynamicField.supportedParams.length > 1
      ) {
        console.log("props Gate Security: ", props);
        
        HelpContentsRegistry.register(dynamicField.connectorType, dynamicField.helpText);
        return (
          <div className="grid-span-4 fullWidthContainer">
            <FormikFormField
              name={dynamicField.connectorType}
              label={dynamicField.connectorType}
              help={<HelpField id={dynamicField.connectorType} />}
              input={() => (
                <LayoutProvider value={StandardFieldLayout}>
                  <div className="flex-container-v margin-between-lg dynamicFieldSection">
                    <EvaluateVariablesStageForm
                      blockLabel={dynamicField.connectorType}
                      chosenStage={chosenStage}
                      headers={dynamicField.supportedParams}
                      isMultiSupported={dynamicField.isMultiSupported}
                      fieldMapName = "gateSecurity"
                      parentIndex={index}
                      {...props}
                    />
                  </div>
                </LayoutProvider>
              )}
            />
          </div>
        );
      } else {
        return null;
      }
    });
  };


  return (
    <div className="VisibilityApprovalConfig">
      <FormikStageConfig
        {...props}
        onChange={props.updateStage}
        render={(props: IFormikStageConfigInjectedProps) => (
          <div>
          <div className="flex">
            <div className="grid leftGrid"></div>
            {/* <div className="grid grid-4 mainForm">{renderComponent({ ...props })}</div> */}
            <div className="grid grid-4">{renderComponent({ ...props })}</div>
            <div className="opsmxLogo">
              <img
                src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
                alt="logo"
              ></img>
            </div>
          </div>


            </div>


        )}
      />
    </div>
  );
}

export function validate(stageConfig: IStage) {
  const validator = new FormValidator(stageConfig);

  validator
    .field('parameters.gateUrl')
    .required()
    .withValidators((value, label) => (value = '' ? `Gate Url is required` : undefined));
  // validator
  //   .field('parameters.gate')
  //   .required()
  //   .withValidators((value, label) => (value = '' ? `${label} is required` : undefined));
  // validator
  //   .field('parameters.imageids')
  //   .required()
  //   .withValidators((value, label) => (value = '' ? `${label} is required` : undefined));
  return validator.validateForm();
}
