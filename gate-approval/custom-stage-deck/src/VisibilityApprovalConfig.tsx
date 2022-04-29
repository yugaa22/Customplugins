import React from 'react';
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
} from '@spinnaker/core';
import './VisibilityApproval.less';
import { EvaluateVariablesStageForm } from './input/dynamicFormFields';

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

  const singleFieldComponent = (fieldParams: any) => {
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

  const multiFieldComp = (props: any, fieldParams: any) => {
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

  const renderComponent = (props: any) => {
    let renderContent = null;
    const fieldParams = props.formik.values.parameters ?? null;
    if (fieldParams !== null) {
      renderContent = (
        <>
          <div className="grid-span-4 fullWidthContainer">
            <FormikFormField
              name="parameters.gateUrl"
              label="Gate Url"
              help={<HelpField id="opsmx.approval.gateUrl" />}
              input={(props) => <TextInput className="fullWidthField" {...props} />}
            />
          </div>
          {singleFieldComponent(fieldParams)}
          {multiFieldComp({ ...props }, fieldParams)}

          <div className="grid-span-4 fullWidthContainer">
            <FormikFormField
              name="parameters.imageIds"
              label="Image Ids"
              help={<HelpField id="opsmx.approval.imageIds" />}
              input={(props) => <TextInput className="fullWidthField" {...props} />}
            />
          </div>

          <div className='p-4'>
              <div className="grid-span-4">
                <h4 className="sticky-header ng-binding">Gate Security</h4>
                <br />
                <div className="grid-span-2">
                  {fieldParams.gateUrl}
                </div>
                {multiFieldGateSecurityComp({ ...props }, fieldParams)}
              </div>
        </div>
        </>
      );
    } else {
      renderContent = exceptionDiv;
    }
    return renderContent;
  };


// Gate Security

  const fieldParams = { "connectors": [{ "connectorType": "PayloadConstraints", "helpText": "Payload Constraints", "isMultiSupported": true, "label": "Payload Constraints", "supportedParams": [{ "helpText": "Key", "label": "Key", "name": "label", "type": "string" }, { "helpText": "Value", "label": "Value", "name": "value", "type": "string" }], "values": [{ "label": "${bn}", "value": "Dev-run-tests-on-staging-master" }] }], "gateUrl": "https://isd.prod.opsmx.net/gate/visibilityservice/v5/approvalGates/3/trigger", "imageIds": "opsmx:latest" }
  
  const multiFieldGateSecurityComp = (props: any, fieldParams:any) => {
    // const fieldParams = props.formik.values.parameters ?? null
    return fieldParams.connectors.map((dynamicField: any, index: number) => {
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
            <div className="grid grid-4 mainForm">{renderComponent({ ...props })}</div>
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
