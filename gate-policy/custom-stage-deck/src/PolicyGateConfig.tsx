import React, { useEffect, useState } from 'react';

import {
  ExecutionDetailsSection,
  ExecutionDetailsTasks,
  FormikFormField,
  FormikStageConfig,
  FormValidator,
  HelpContentsRegistry,
  HelpField,
  IExecutionDetailsSectionProps,
  IFormikStageConfigInjectedProps,
  IgorService,
  IStage,
  IStageConfigProps,
  IStageForSpelPreview,
  IStageTypeConfig,
  LayoutProvider,
  NumberInput,
  ReactSelectInput,
  REST,
  StandardFieldLayout,
  TextAreaInput,
  TextInput,
  useData,
  Validators,
} from '@spinnaker/core';

import './PolicyGate.less';
import { EvaluateVariablesStageForm } from './input/dynamicFormFields';
/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `maxWaitTime` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */
export function PolicyGateConfig(props: IStageConfigProps) {

  console.log(props);
  

  const[applicationId , setApplicationId] = useState()  

  const[environmentsList , setenvironmentsList] = useState([]);

  useEffect(()=> {  
    REST('platformservice/v2/applications/name/'+props.application['applicationName']).
    get()
    .then(
      (results)=> {
        setApplicationId(results.applicationId);
        REST('platformservice/v4/applications/'+results.applicationId).
        get()
        .then(
          function (results) { 
            if(results['services'].length > 0 ) {
              let index = results['services'].map((i: { serviceName: any; }) => i.serviceName).indexOf(props.pipeline.name);
              props.stage['serviceId'] = results['services'][index].serviceId;
              props.stage['pipelineId'] = results['services'][index].serviceId;
            }     
          }
        );
        props.stage['applicationId'] = results.applicationId;
      }    
    )      
  }, []) 

  ///gate/oes/v2/policy/users/user2/runtime?permissionId=read
   
  useEffect(()=> {  
   if(!props.stage.hasOwnProperty('parameters')){
    props.stage.parameters = {}
  }
   REST('oes/accountsConfig/spinnaker/environments').
   get()
   .then(
     (results)=> {
       setenvironmentsList(results);       
     }     
   )
   
 }, []) 

 const getGateSecurityParams = () => {
  if(!props.stage.parameters.hasOwnProperty('gateSecurity')){
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

  //const fieldParams = { "payloadConstraint": [{ "connectorType": "PayloadConstraints", "helpText": "Payload Constraints", "isMultiSupported": true, "label": "Payload Constraints", "supportedParams": [{ "helpText": "Key", "label": "Key", "name": "label", "type": "string" }, { "helpText": "Value", "label": "Value", "name": "value", "type": "string" }], "values": [{ "label": "${bn}", "value": "Dev-run-tests-on-staging-master" }] }], "gateUrl": "https://isd.prod.opsmx.net/gate/visibilityservice/v5/approvalGates/3/trigger", "imageIds": "opsmx:latest" }
  const [chosenStage] = React.useState({} as IStageForSpelPreview);
  const multiFieldComp = (props: any, formik :any) => {
    getGateSecurityParams();
    const fieldParams = props.stage.parameters ?? null;
      console.log("fieldParams");
     console.log(fieldParams);
    return fieldParams?.gateSecurity.map((dynamicField: any, index: number) => {
      if (
        (dynamicField.supportedParams.length > 0 && dynamicField.isMultiSupported) ||
        dynamicField.supportedParams.length > 1
      ) {
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
                      parentIndex={index}
                      formik = {formik}
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

  const HorizontalRule = () => (
    <div className="grid-span-4">
      <hr />
    </div>
  );
  return (
    <div className="PolicyGateConfig">
      <FormikStageConfig
        {...props}
        onChange={props.updateStage}
        render={({ formik }: IFormikStageConfigInjectedProps) => (
          <div className="flex">
            <div className="grid"></div>
            <div className="grid grid-4 form mainform">
            {/* <div className="grid-span-2">

              <FormikFormField
                label="Select Policy"
                name="Select Policy"
                input={(props) => (
                  <ReactSelectInput
                    {...props}
                    clearable={false}
                    options={fetchAccountsResult && fetchAccountsResult.map((template: any) => ({
                      label: template.policyName,
                      value: template.policyId
                    }))}
                    searchable={true}
                  />
                )}
              />

            </div> */}
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.policyurl"
                  label="Policy Proxy"
                  help={<HelpField id="opsmx.policy.policyProxy" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.policypath"
                  label="Policy Path"
                  help={<HelpField id="opsmx.policy.policyPath" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <HorizontalRule />
              <div className="grid-span-4 payloadTextarea">
                <FormikFormField
                  name="parameters.payload"
                  label="Payload"
                  help={<HelpField id="opsmx.policy.payload" />}
                  input={(props) => <textarea className="policyTextArea" {...props}></textarea>}
                />
              </div>
              <HorizontalRule />
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.gate"
                  label="Gate Name"
                  help={<HelpField id="opsmx.policy.gateName" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.imageids"
                  label="Image IDs"
                  help={<HelpField id="opsmx.policy.imageIds" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <HorizontalRule />
              <div className="grid-span-4">
                <h4 className="sticky-header ng-binding">Gate Security</h4>
                <br />
                <div className="grid-span-2">
                  {/* {fieldParams.gateUrl} */}
                </div>
                {multiFieldComp({ ...props }, formik)}
              </div>
            </div>
            <div className="opsmxLogo">
              <img
                src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
                alt="logo"
              ></img>
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
    .field('parameters.policyurl')
    .required()
    .withValidators((value, label) => (value = '' ? `Policy Proxy is required` : undefined));
  validator
    .field('parameters.policypath')
    .required()
    .withValidators((value, label) => (value = '' ? `Policy Path is required` : undefined));
  validator
    .field('parameters.gate')
    .required()
    .withValidators((value, label) => (value = '' ? `Gate Name is required` : undefined));
  validator
    .field('parameters.imageids')
    .required()
    .withValidators((value, label) => (value = '' ? `Image IDs is required` : undefined));

  return validator.validateForm();
}
