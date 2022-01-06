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
  TextAreaInput,
  TextInput,
  Validators,
} from '@spinnaker/core';

import './PolicyGate.less';

/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `maxWaitTime` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */
export function PolicyGateConfig(props: IStageConfigProps) {
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
        render={() => (
          <div className="flex">
            <div className="grid"></div>
            <div className="grid grid-4 form mainform">
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
  validator
    .field('parameters.payload')
    .required()
    .withValidators((value, label) => (value = '' ? `Payload is required` : undefined));

  return validator.validateForm();
}
