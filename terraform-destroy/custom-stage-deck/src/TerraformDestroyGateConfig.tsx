import React from 'react';

import {
  ExecutionDetailsSection,
  ExecutionDetailsTasks,
  FormikFormField,
  FormikStageConfig,
  FormValidator,
  HelpContentsRegistry,
  HelpField,
  IExecutionDetailsSectionProps,
  IStage,
  IStageConfigProps,
  IStageTypeConfig,
  NumberInput,
  ReactSelectInput,
  TextAreaInput,
  TextInput,
  Validators,
} from '@spinnaker/core';

import './TerraformDestroyGate.less';

/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `maxWaitTime` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */
export function TerraformDestroyGateConfig(props: IStageConfigProps) {
  const HorizontalRule = () => (
    <div className="grid-span-4">
      <hr />
    </div>
  );
  return (
    <div className="TeraformDestroyGateConfig">
      <FormikStageConfig
        {...props}
        onChange={props.updateStage}
        render={() => (  
          <div className="flex">
            <div className="grid"></div>
            <div className="grid grid-4 form mainform">
              <div className="grid-span-2">
              <FormikFormField
                  name="parameters.AWSAccountName"
                  label="AWS Account Name"
                  help={<HelpField id="opsmx.terraformdestroy.AWSAccountName" />}
                  input={(props) => (
                    <ReactSelectInput
                    clearable={false}
                    onChange={(o: React.ChangeEvent<HTMLSelectElement>) => {
                      this.props.formik.setFieldValue('parameters.AWSAccountName', o.target.value);
                    }}
                    //value={...props}
                    //stringOptions={...props}
                    />
                  )}
                /> 
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.spinnakerNamespace"
                  label="Spinnaker Namespace"
                  help={<HelpField id="opsmx.terraformdestroy.spinnakerNamespace" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>       
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfScriptAccpint"
                  label="Terraform Script Account"
                  help={<HelpField id="opsmx.terraformdestroy.tfScriptAccount" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfScriptRepo"
                  label="Terraform Script Repository"
                  help={<HelpField id="opsmx.terraformdestroy.tfScriptRepo" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>             
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfLocation"
                  label="Terraform Location"
                  help={<HelpField id="opsmx.terraformdestroy.tfLocation" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>     
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.overrideFile"
                  label="Override File"
                  help={<HelpField id="opsmx.terraformdestroy.overrideFile" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfStateAccount"
                  label="Terraform State Account"
                  help={<HelpField id="opsmx.terraformdestroy.tfStateAccount" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.artifactRepo"
                  label="Artifact Repository"
                  help={<HelpField id="opsmx.terraformdestroy.artifactRepo" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.artifactUUID"
                  label="Artifact UUID"
                  help={<HelpField id="opsmx.terraformdestroy.artifactUUID" />}
                  input={(props) => <TextInput {...props} />}
                />
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
    .field('parameters.AWSAccountName')
    .required()
    .withValidators((value, label) => (value = '' ? `AWS Account Name is required` : undefined));
  validator
    .field('parameters.spinnakerNamespace')
    .required()
    .withValidators((value, label) => (value = '' ? `Spinnaker Namespace is required` : undefined));
  validator
    .field('parameters.tfScriptAccount')
    .required()
    .withValidators((value, label) => (value = '' ? `Terraform Script Account is required` : undefined));
  validator
    .field('parameters.tfScriptRepo')
    .required()
    .withValidators((value, label) => (value = '' ? `Terraform Script Repository is required` : undefined));
  validator
    .field('parameters.tfLocation')
    .required()
    .withValidators((value, label) => (value = '' ? `Terraform Location is required` : undefined));
  validator
    .field('parameters.overrideFile')
    .required()
    .withValidators((value, label) => (value = '' ? `Override File is required` : undefined));
  validator
    .field('parameters.tfStateAccount')
    .required()
    .withValidators((value, label) => (value = '' ? `Terraform State Account is required` : undefined));
  validator
    .field('parameters.artifactRepo')
    .required()
    .withValidators((value, label) => (value = '' ? `Artifact Repository is required` : undefined));
  validator
    .field('parameters.artifactUUID')
    .required()
    .withValidators((value, label) => (value = '' ? `Artifact UUID is required` : undefined));

  return validator.validateForm();
}
