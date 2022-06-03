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
import { EvaluateVariablesStageForm } from './input/dynamicFormFieldsGrid';
/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `maxWaitTime` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */
export function PolicyGateConfig(props: IStageConfigProps) {

  console.log(props);


  const [applicationId, setApplicationId] = useState()

  const [environmentsList, setenvironmentsList] = useState([]);

  const [showEnvironment, setshowEnvironment] = useState(false);

  //const [newEnvironment, setnewEnvironment] = useState("");

  const [policyList, setPolicyList] = useState([]);

  const getGateSecurityParams = () => {
    if (!props.stage.parameters.hasOwnProperty('gateSecurity')) {
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
            // {
            //   "label": "",
            //   "value": ""
            // }
          ]
        }
      ]
    }
  }

  useEffect(() => {
    REST('platformservice/v2/applications/name/' + props.application['applicationName']).
      get()
      .then(
        (results) => {
          setApplicationId(results.applicationId);
          REST('platformservice/v4/applications/' + results.applicationId).
            get()
            .then(
              function (results) {
                if (results['services'].length > 0) {
                  let index = results['services'].map((i: { serviceName: any; }) => i.serviceName).indexOf(props.pipeline.name);
                  props.stage['serviceId'] = results['services'][index].serviceId;
                  //props.stage['pipelineId'] = results['services'][index].serviceId;
                  const pipelines = results.services[index].pipelines;
                  const pipelineIndex = pipelines.findIndex((pipeline: any) => pipeline.pipelineName == props.pipeline.name);
                  if (pipelineIndex >= 0) {
                    props.stage['pipelineId'] = pipelines[pipelineIndex].pipelineId;
                  }
                }
              }
            );
          props.stage['applicationId'] = results.applicationId;
        }
      )
  }, [])

  ///gate/oes/v2/policy/users/user2/runtime?permissionId=read

  useEffect(() => {
    if (!props.stage.hasOwnProperty('parameters')) {
      props.stage.parameters = {}
    }
    if (!props.stage.parameters.hasOwnProperty('environment')) {
      props.stage.parameters.environment = [{
        "id": null,
        "spinnakerEnvironment": ""
      }]
    }
    // if(!props.stage.parameters.hasOwnProperty('customEnvironment')){
    //   props.stage.parameters.customEnvironment = "";
    // }
    if (!props.stage.parameters.hasOwnProperty('policyName')) {
      props.stage.parameters.policyName = "";
    }
    if (!props.stage.parameters.hasOwnProperty('policyId')) {
      props.stage.parameters.policyId = "";
    }
    REST('oes/accountsConfig/spinnaker/environments').
      get()
      .then(
        (results) => {
          let temp = results;
          temp.push({
            "id": 0,
            "spinnakerEnvironment": "Add new Environment"
          });
          setenvironmentsList(results);
          setenvironmentsList(results);
          if (props.stage.parameters.environment[0].id == 0 && props.stage.parameters.customEnvironment.length > 0) {
            //Find Id from Environment list
            const findId = temp.findIndex((val: any) => val.spinnakerEnvironment == props.stage.parameters.customEnvironment);
            if (findId > 0) {
              props.stage.parameters.environment[0].id = temp[findId].id;
              props.stage.parameters.environment[0].spinnakerEnvironment = temp[findId].spinnakerEnvironment;
            }
          }
          console.log("Environmen API: ", temp);
        }
      )
    REST('oes/v2/policy/users/' + props.application.attributes.user + '/runtime?permissionId=read').
      get()
      .then(
        (results) => {
          console.log("policylist");
          console.log(results);
          setPolicyList(results);
        }
      )

      getGateSecurityParams();
      
  }, [])

 

  // Environments 
  const handleOnEnvironmentSelect = (e: any, formik: any) => {
    if (e.target.value === 0) {
      setshowEnvironment(true);
      props.stage.parameters.environment[0].id = 0;
      props.stage.parameters.environment[0].spinnakerEnvironment = 'Add new Environment';
    } else {
      setshowEnvironment(false);
      props.stage.parameters.customEnvironment = "";
      const index = e.target.value;
      const spinnValue = environmentsList.filter((e: any) => e.id == index)[0].spinnakerEnvironment;
      formik.setFieldValue("parameters.environment[0]['id']", index);
      formik.setFieldValue("parameters.environment[0]['spinnakerEnvironment']", spinnValue);
      //   formik.setFieldValue("parameters.environment]", [{
      //   "id": index,
      //   "spinnakerEnvironment": spinnValue
      // }]); 
    }
  }

  const handleOnPolicySelect = (e: any, formik: any) => {
    const index = e.target.value;
    const name = policyList.filter(e => e.policyId == index)[0].policyName;
    formik.setFieldValue("parameters.policyName", name);
    formik.setFieldValue("parameters.policyId", index);
  }

  // const pushNewEnvironment = (data: any) => {
  //   //setnewEnvironment(data);
  //   props.stage.parameters.customEnvironment = data;
  // }



  const [chosenStage] = React.useState({} as IStageForSpelPreview);
  // const multiFieldComp = (props: any, formik: any) => {
  //   getGateSecurityParams();
  //   const fieldParams = props.stage.parameters ?? null;
  //   console.log("fieldParams");
  //   console.log(fieldParams);
  //   return fieldParams?.gateSecurity.map((dynamicField: any, index: number) => {
  //     if (
  //       (dynamicField.supportedParams.length > 0 && dynamicField.isMultiSupported) ||
  //       dynamicField.supportedParams.length > 1
  //     ) {
  //       HelpContentsRegistry.register(dynamicField.connectorType, dynamicField.helpText);
  //       return (
  //         <div className="grid-span-4 fullWidthContainer">
  //           <FormikFormField
  //             name={dynamicField.connectorType}
  //             label={dynamicField.connectorType}
  //             help={<HelpField id={dynamicField.connectorType} />}
  //             input={() => (
  //               <LayoutProvider value={StandardFieldLayout}>
  //                 <div className="flex-container-v margin-between-lg dynamicFieldSection">
  //                   <EvaluateVariablesStageForm
  //                     blockLabel={dynamicField.connectorType}
  //                     chosenStage={chosenStage}
  //                     headers={dynamicField.supportedParams}
  //                     isMultiSupported={dynamicField.isMultiSupported}
  //                     fieldMapName="gateSecurity"
  //                     parentIndex={index}
  //                     formik={formik}
  //                     {...props}
  //                   />
  //                 </div>
  //               </LayoutProvider>
  //             )}
  //           />
  //         </div>
  //       );
  //     } else {
  //       return null;
  //     }
  //   });
  // };

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
            <div className="form mainform">
              <div className="form-horizontal">
                <div className="form-group">
                  <div className="col-md-3 sm-label-right">
                    Environment * <HelpField id="opsmx.policy.environment" />
                  </div>
                  <div className="col-md-7">
                    <div className="grid-span-2">
                      <FormikFormField
                        name="parameters.environment[0]"
                        // label="Enviornment *"
                        //  help={<HelpField id="opsmx.policy.environment" />}
                        input={() => (
                          <ReactSelectInput
                            {...props}
                            clearable={false}
                            required={true}
                            onChange={(e) => { handleOnEnvironmentSelect(e, formik) }}
                            options={environmentsList.map((item: any) => (
                              {
                                value: item.id,
                                label: item.spinnakerEnvironment
                              }))}
                            value={formik.values.parameters.environment[0].id}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="form-horizontal">
                <div className="form-group">
                  {showEnvironment ? (
                    <>
                      <div className="col-md-3 sm-label-right">
                        Add new Environment<HelpField id="opsmx.policy.customEnvironment" />
                      </div>
                      <div className="col-md-7">
                        <div className='grid-span-2'>

                          <FormikFormField
                            name="parameters.customEnvironment"
                            // label="Add new Environment"
                            // help={<HelpField id="opsmx.policy.customEnvironment" />}           
                            input={(props) => <TextInput {...props} />}
                          />
                        </div>
                      </div>
                    </>) :
                    null
                  }
                </div>
              </div>

              <div className="form-horizontal">
                <div className="form-group">

                  <div className="col-md-3 sm-label-right">
                    Policy *<HelpField id="opsmx.policy.policyName" />
                  </div>
                  <div className="col-md-7">
                    <div className="grid-span-3">

                      <FormikFormField
                        label=""
                        name="parameters.policyId"
                        // help={<HelpField id="opsmx.policy.policyName" />}
                        input={(props) => (
                          <ReactSelectInput
                            {...props}
                            clearable={false}
                            required={true}
                            onChange={(e) => { handleOnPolicySelect(e, formik) }}
                            options={policyList && policyList.map((policy: any) => ({
                              label: policy.policyName,
                              value: policy.policyId
                            }))}
                            value={formik.values.parameters.policyId}
                            searchable={true}
                          />
                        )}
                      />

                    </div>
                  </div>
                </div>
              </div>

              {/* <div className="grid-span-2">
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
              </div> */}
              <HorizontalRule />

              <div className="form-horizontal">
                <div className="form-group">
                  <div className="col-md-3 sm-label-right">
                    Payload<HelpField id="opsmx.policy.payload" />
                  </div>
                  <div className="col-md-7">
                    <div className="grid-span-4 payloadTextarea">
                      <FormikFormField
                        name="parameters.payload"
                        // label="Payload"
                        // help={<HelpField id="opsmx.policy.payload" />}
                        input={(props) => <textarea className="policyTextArea" {...props}></textarea>}
                      />
                    </div>
                  </div>
                </div>
              </div>


              <HorizontalRule />
              {/* <div className="grid-span-2">
                <FormikFormField
                  name="parameters.gate"
                  label="Gate Name"
                  help={<HelpField id="opsmx.policy.gateName" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div> */}
              <div className="form-horizontal">
                <div className="form-group">
                  <div className="col-md-3 sm-label-right">
                  Instance Id *<HelpField id="opsmx.policy.imageIds" />
                  </div>
                  <div className="col-md-7">
                    <div className="grid-span-2">
                      <FormikFormField
                        name="parameters.imageids"
                        // label="Image IDs *"
                        // help={<HelpField id="opsmx.policy.imageIds" />}
                        input={(props) => <TextInput {...props} />}
                        required={true}
                      />
                    </div>
                  </div>
                </div>
              </div>




              {/* <HorizontalRule />
              <div className="grid-span-4">
                <h4 className="sticky-header ng-binding">Gate Security</h4>
                <br />
                <div className="grid-span-2">
                 
                </div>
                {multiFieldComp({ ...props }, formik)}
              </div> */}
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
    .field('parameters.environment')
    .required()
    .withValidators((value, label) => (value = '' ? `Environment is required` : undefined));

  validator
    .field('parameters.policyName')
    .required()
    .withValidators((value, label) => (value = '' ? `policy Name is required` : undefined));
  validator
    .field('parameters.imageids')
    .required()
    .withValidators((value, label) => (value = '' ? `Image IDs is required` : undefined));

  return validator.validateForm();
}
