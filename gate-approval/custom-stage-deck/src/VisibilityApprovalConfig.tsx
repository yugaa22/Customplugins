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

  //Load List of Connectors Details
  const [listOfConnectors, setListOfConnectors] = useState([])

    useEffect(()=> {  
    if(!props.stage.hasOwnProperty('parameters')){
      props.stage.parameters = {}
    }
    
    if(!props.stage.parameters.hasOwnProperty('environment')){
      props.stage.parameters.environment = [{
      "id": null,
      "spinnakerEnvironment": ""
    }]
    }

    if(!props.stage.parameters.hasOwnProperty('connectors')){
        props.stage.parameters.connectors = [];
    }
    
    if(!props.stage.parameters.hasOwnProperty('approvalGroups')){
      props.stage.parameters.approvalGroups = []
    }

    if(!props.stage.parameters.hasOwnProperty('automatedApproval')){
      props.stage.parameters.automatedApproval = [{
        "policyId": null,
        "policyName": ""
      }]
    }

    REST(`visibilityservice/v6/getAllConnectorFields`).
    get()
    .then(
      (connectors)=> {
            setListOfConnectors(connectors)
      }
    );

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



  const addSelectedConnectorParameters = () => {
    console.log("Adding selectedConnectors");
    // If selected connectors are empty push the default template
    if(!props.stage?.parameters.hasOwnProperty('selectedConnectors')){
      props.stage.parameters.selectedConnectors = [
      {
        "connectorType": "Connectors *",
        "helpText": "List of Connectors Configured",
        "isMultiSupported": true,
        "label": "Connectors *",
        "selectInput": true,
        "supportedParams": [
          {
            "helpText": "Connector",
            "label": "Connector",
            "name": "connector",
            "type": "string"
          },
          {
            "helpText": "Account",
            "label": "Account",
            "name": "account",
            "type": "string"
          }
        ],
        "values": [
          {
            "account": "",
            "connector": ""
          }
        ]
      }
    ]
    }
  }

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

      //Add Serivce and Pipeline Details to the JSON
  const getServicePipelineDetails = (data: any) =>{
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

    // Environments
    const[environmentsList , setEnvironmentList] = useState([]);
    const [showEnvironment, setshowEnvironment] = useState(false);

    useEffect(()=> {  
    REST('oes/accountsConfig/spinnaker/environments').
    get()
    .then(
      (response)=> {
        let temp = response;
        temp.push({
          "id": 0,
        "spinnakerEnvironment": "Add new Environment"
      });
      setEnvironmentList(temp);

    if(props.stage.parameters.environment[0].id == 0 && props.stage.parameters.customEnvironment.length > 0 ){

      //Find Id from Environment list
      const findId = temp.findIndex((val:any) => val.spinnakerEnvironment == props.stage.parameters.customEnvironment);
      if(findId > 0){
        props.stage.parameters.environment[0].id = temp[findId].id;
        props.stage.parameters.environment[0].spinnakerEnvironment = temp[findId].spinnakerEnvironment;
      }
    }

      console.log("Environmen API: ", temp);
      

      }     
    )
  }, []) 


  const handleOnEnvironmentSelect = (e:any, formik:any) => {





    console.log("Handle Environment: ", props);
    

    if(e.target.value === 0){
      setshowEnvironment(true);
    props.stage.parameters.environment[0].id = 0;
    props.stage.parameters.environment[0].spinnakerEnvironment = 'Add new Environment'

    // props.formik.setFieldValue("parameters.environment]", [{
    //   "id": 0,
    //   "spinnakerEnvironment": 'Add new Environment'
    // }]); 

    }else{
      setshowEnvironment(false);
      props.stage.parameters.customEnvironment = "";
    const index = e.target.value;
    const spinnValue = environmentsList.filter((e:any) => e.id == index)[0].spinnakerEnvironment;
    console.log("spinnValue", props.stage.parameters);
      formik.setFieldValue("parameters.environment[0]['id']", index);
      formik.setFieldValue("parameters.environment[0]['spinnakerEnvironment']", spinnValue);
    }


    console.log("After update handleOnEnvironmentSelect", props);
  }

    //Automated Approval

    const[policyList , setpolicyList] = useState([]);
    useEffect(()=> {  
    REST(`oes/v2/policy/users/${props.application.attributes.user}/runtime?permissionId=read`).
    get()
    .then(
      (results)=> {
        setpolicyList(results);       
      }     
    )
  }, []) 

  const handleAutomatedApproval = (e:any, props: any) => {
    console.log("Automated Approval: ", props);
    const index = e.target.value;
    const policyName = policyList.filter((e:any) => e.policyId == index)[0].policyName;
    props.formik.setFieldValue("parameters.automatedApproval]", [{
      "policyId": index,
      "policyName": policyName
    }]); 
  }


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
    props.formik.setFieldValue(`parameters.approvalGroups`, e)
  }
  
  // const [checked, setChecked] = useState(false);

  const handleCheckbox = (e:any, props: any) => { 
    // setChecked(e.target.checked);    
    props.formik.setFieldValue('parameters.isAutomatedApproval', e.target.checked)
    console.log('FormikValues: ', props.formik.values);     
  }; 


  // selectedConnectors 

  const [connectorTypeList, setConnectorTypeList] = useState([]); 

  useEffect(() => {
    REST(`visibilityservice/v1/toolConnectors/configuredConnectorTypes`).
    get()
    .then((response) => {
      setConnectorTypeList(response)
    })
  }, [])


  const [selectedConnector, setSelectedConnector] = useState("");
  const [accountsOptions, setAccountsOptions] = useState([])
  const [loadConnectors, setLoadConnectors] = useState(true);

  React.useEffect(()=> {

    if(!selectedConnector){
      return;
    }
    REST(`platformservice/v6/users/${props.application.attributes.user}/datasources?datasourceType=${selectedConnector}&permissionId=view`).
    get()
    .then((response) => {

      if(listOfConnectors && (selectedConnector.length > 0)){
      // Find Index of listOfConnectors to see if the selected connector is present
            const findIndex = accountsOptions.findIndex((specificAccountOption : any) => specificAccountOption[selectedConnector.toLowerCase()] == selectedConnector.toLowerCase());

            if(findIndex < 0){
              let temp: any = {};
              temp[selectedConnector.toLowerCase()] = response;
              setAccountsOptions([...accountsOptions, temp]);
            }
      }
    })
    

  }, [selectedConnector])


  React.useEffect(()=> {
    
    setListOfConnectors(listOfConnectors)
   
    // Check if connectors are present in the Parameters
    if(listOfConnectors.length > 0){
      console.log(" list of connectors Present", listOfConnectors);

        // Find the object of selected Connectors in listOfConnectors and push it to connectors
        const indexOfSelectedConnector = listOfConnectors.findIndex((connector: any) => connector.connectorType.toLowerCase() == selectedConnector.toLowerCase());
        if(indexOfSelectedConnector >= 0){
          // Check if the  connectorType exists in connectors
          const findConnectorIndex = props.stage.parameters.connectors.findIndex((obj: any) => obj.connectorType.toLowerCase() == selectedConnector.toLowerCase() );
          if(findConnectorIndex < 0){
            props.stage.parameters.connectors.push(listOfConnectors[indexOfSelectedConnector]);
          }
        }

      setLoadConnectors(false);
      setTimeout(() => {
      setLoadConnectors(true);
      }, 100);
    }
    
  }, [listOfConnectors, selectedConnector]);


    const handleOnSelection = (e:any, label:string, index:number, props:any) => {
          
          if(label == "Connector"){
            setSelectedConnector(e.target.value);
            props.formik.setFieldValue(`parameters.selectedConnectors[0].values[${index}].connector`, e.target.value); 
            console.log("selectedConnectors Value: ", selectedConnector);
          }
      }

  //  Component Starts ------------------------------

  const singleFieldComponent = (fieldParams: any) => {

    fieldParams = props.stage.parameters ?? null
    if(!(fieldParams && fieldParams.connectors)){
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
          <div className="grid-span-2">
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
      const propsFormik = props.formik.values;
      if(!propsFormik?.parameters){
        return;
      }
        return <>
        <div className='grid grid-4'>

            <div className="grid-span-1">

               <FormikFormField
                // name={props.stage.parameters.environment[0].spinnakerEnvironment}
                name="parameters.environment[0]"
                label="Environment *"
                input={() => (
                  <ReactSelectInput
                  {...props}
                  clearable={false}
                  // value={`parameters.environment[0]['id]`}
                  onChange={(e) => {handleOnEnvironmentSelect(e, props.formik)}}
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
                  value={props.formik.values?.parameters.environment[0].id}
                  // stringOptions={...props}
                  />
                )}
              />       

            </div>

            <div className="grid-span-1 fullWidthContainer">
              {showEnvironment ?
                  <FormikFormField
                  name="parameters.customEnvironment"
                  label="Add new Environment"
                  help={<HelpField id="opsmx.approval.customEnvironment" />}
                  input={(props) => <TextInput {...props} />} 
                  />
                  :
                  null
                }
            </div>



            {/* Automated Approval */}

            <div className="grid-span-1 fullWidthContainer">
              <div className="automatedDiv">

              <input type="checkbox" checked={propsFormik?.parameters?.isAutomatedApproval} onChange={(e) => handleCheckbox(e, props)}  /> 
              <span className='automatedSpan'>Automated Approval</span>
              </div>

               {propsFormik?.parameters?.isAutomatedApproval ? 
              <div className="grid">
                
                <div className="grid-span-1 automatedApprovalAlign">              
                  <FormikFormField
                    name="parameters.automatedApproval[0].policyId"
                    label=""
                    input={(automatedApproval) => (
                      <ReactSelectInput
                      {...automatedApproval}
                      clearable={false}
                      onChange={(e:any) => handleAutomatedApproval(e,props)}
                      //   this.props.formik.setFieldValue('parameters.connectorType', o.target.value);
                      // }}
                      options={policyList && policyList.map((policy: any) => ({
                        value: policy.policyId,
                        label: policy.policyName
                      }))} 
                      value={props.formik.values.parameters?.automatedApproval[0].policyId}
                      //stringOptions={...props}
                      />
                    )}
                  />       
                </div>

              </div>
            : null}

            </div>
        </div>

            {/* Approval Groups */}
        <div  className='grid grid-4'>
            <div className="grid-span-1">
              <div className='sp-formItem'>

                <p className='approvalGroupTxt'>Approval Groups *</p> 
                <MultiSelect
                  options = {approvalGroupsList && approvalGroupsList.map((approvalGroup: any) => ({
                            label: approvalGroup.userGroupName,
                            value: approvalGroup.userGroupId,
                            userGroupName: approvalGroup.userGroupName,
                            userGroupId: approvalGroup.userGroupId,
                            isAdmin: approvalGroup.isAdmin,
                            isSuperAdmin: approvalGroup.isSuperAdmin
                          }))} 
                  onChange={(e:any) => handleApprovalGroups(e,props)}
                  labelledBy="Select"
                  value={propsFormik?.parameters?.approvalGroups}
                /> 
              </div>
            </div>

        </div>
        
        
        
        <div  className='grid grid-4'>
          {/* Load selectedConnectors */}
          {multiFieldConnectorComp({ ...props })}
        </div>

        <div className="grid grid-4"></div>
        
              {/* Load Connecto Specific Details */}
        <div  className='grid grid-4'>
            {loadConnectors ? multiFieldComp(props) : null}
            {loadConnectors ? singleFieldComponent(props) : null}
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
          {/* {multiFieldComp({ ...props })}  */}

          {/* <div className="grid-span-4 fullWidthContainer">
            <FormikFormField
              name="parameters.imageIds"
              label="Image Ids"
              help={<HelpField id="opsmx.approval.imageIds" />}
              input={(props) => <TextInput className="fullWidthField" {...props} />}
            />
          </div> */}


              {/* Load Image Id's for Execution Details*/}

        <div  className='grid grid-4'>
            <div className="grid-span-4">
              <FormikFormField
                name="parameters.imageids"
                label="Image Ids *"
                help={<HelpField id="opsmx.approval.imageIds" />}
                required={true}
                input={(props) => <TextInput {...props} />}
              />
              </div>
        </div>

        
        <div  className='grid grid-4'>

              <div className="grid-span-2">
                <h4 className='gateSecurity'>Gate Security</h4>
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
  
  const multiFieldGateSecurityComp = (props: any) => {
    getGateSecurityParams();

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


  //MultiField Selected Connectors dropdown

  const multiFieldConnectorComp = (props: any) => {
    addSelectedConnectorParameters();
    const fieldParams = props.formik.values.parameters ?? null
    if(!fieldParams){
      return;
    }
    return fieldParams.selectedConnectors.map((dynamicField: any, index: number) => {
      if (
        (dynamicField?.supportedParams.length > 0 && dynamicField?.isMultiSupported) ||
        dynamicField?.supportedParams.length > 1
      ) {
        
        HelpContentsRegistry.register(dynamicField.connectorType, dynamicField.helpText);
        return (
          <div className="grid-span-2">
            <FormikFormField
              name={dynamicField.connectorType}
              label={dynamicField.connectorType}
              help={<HelpField id={dynamicField.connectorType} />}
              input={() => (
                <LayoutProvider value={StandardFieldLayout}>
                  <div className="flex-container-v margin-between-lg dynamicFieldSection">
                    {/* <div>
                      accountsOptions: {JSON.stringify(accountsOptions)}
                    </div> */}
                    <EvaluateVariablesStageForm
                      blockLabel={dynamicField.connectorType}
                      chosenStage={chosenStage}
                      headers={dynamicField.supportedParams}
                      selectInput={true}
                      connectorValue={selectedConnector}
                      connectorsList={connectorTypeList}
                      // accountValue={accountValue}
                      accountsOptions={accountsOptions}
                      listOfConnectorDetails={ listOfConnectors  }
                      handleOnSelection = {handleOnSelection}
                      fieldMapName = "selectedConnectors" // to read and map fields
                      isMultiSupported={dynamicField.isMultiSupported}
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
          <div className="">

            <div className="opsmxLogo">
              <img
                src="https://cd.foundation/wp-content/uploads/sites/78/2020/05/opsmx-logo-march2019.png"
                alt="logo"
              ></img>
            </div>

            <div className="grid leftGrid"></div>
            {/* <div className="grid grid-4 mainForm">{renderComponent({ ...props })}</div> */}
            <div className="grid">{renderComponent({ ...props })}</div>
          </div>


            </div>


        )}
      />
    </div>
  );
}

export function validate(stageConfig: IStage) {
  const validator = new FormValidator(stageConfig);

  // validator
  //   .field('parameters.gateUrl')
  //   .required()
  //   .withValidators((value, label) => (value = '' ? `Gate Url is required` : undefined));
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
