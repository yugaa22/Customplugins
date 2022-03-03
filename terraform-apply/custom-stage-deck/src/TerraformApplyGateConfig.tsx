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

import './TerraformApplyGate.less';

/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `maxWaitTime` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */
export function TerraformApplyGateConfig(props: IStageConfigProps) {
  const HorizontalRule = () => (
    <div className="grid-span-4">
      <hr />
    </div>
  );
  return (
    <div className="TeraformApplyGateConfig">
      <FormikStageConfig
        {...props}
        onChange={props.updateStage}
        render={() => (
          <div className="flex">
            <div className="grid"></div>
            <div className="grid grid-4 form mainform">
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfScriptAccount"
                  label="Tf Script Account"
                  help={<HelpField id="opsmx.terraformapply.tfScriptAccount" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfScriptRepo"
                  label="Tf Apply Script Repo"
                  help={<HelpField id="opsmx.terraformapply.tfApplyScriptRepo" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>

              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfLocation"
                  label="Tf Location"
                  help={<HelpField id="opsmx.terraformapply.tfLocation" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.overrideFile"
                  label="Override File"
                  help={<HelpField id="opsmx.terraformapply.overrideFile" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.tfStateAccount"
                  label="Tf State Account"
                  help={<HelpField id="opsmx.terraformapply.tfStateAccount" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.artifactRepo"
                  label="Artifact Repo"
                  help={<HelpField id="opsmx.terraformapply.artifactRepo" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.artifactUUID"
                  label="Artifact UUID"
                  help={<HelpField id="opsmx.terraformapply.artifactUUID" />}
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
    .field('parameters.tfScriptAccount')
    .required()
    .withValidators((value, label) => (value = '' ? `Terraform Script Account is required` : undefined));
  validator
    .field('parameters.tfApplyScriptRepo')
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
