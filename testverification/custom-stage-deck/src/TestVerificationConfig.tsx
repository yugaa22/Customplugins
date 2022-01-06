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
  TextInput,
  RadioButtonInput,
  DayPickerInput,
  IStageConfigProps,
  IStageTypeConfig,
  NumberInput,
  Validators,
} from '@spinnaker/core';
import './TestVerification.less';
import { DateTimePicker } from './input/DateTimePickerInput';

const HorizontalRule = () => (
  <div className="grid-span-4">
    <hr />
  </div>
);

export function TestVerificationConfig(props: IStageConfigProps) {
  const ANALYSIS_TYPE_OPTIONS: any = [
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' },
  ];
  return (
    <div className="TestVerificationGateConfig">
      <FormikStageConfig
        {...props}
        onChange={props.updateStage}
        render={() => (
          <div className="flex">
            <div className="grid"></div>
            <div className="grid grid-4 form mainform">
              <div className="grid-span-3">
                <FormikFormField
                  name="parameters.gateurl"
                  label="Gate Url"
                  help={<HelpField id="opsmx.testVerification.gateUrl" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div>
                <FormikFormField
                  name="parameters.lifetime"
                  label="LifeTimeHours"
                  help={<HelpField id="opsmx.testVerification.lifeTimeHours" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <HorizontalRule />
              <div className="grid grid-span-4">
                <div className="testCol1">
                  <FormikFormField
                    name="parameters.minicanaryresult"
                    label="Minimum Canary Result"
                    help={<HelpField id="opsmx.testVerification.minimumCanaryResult" />}
                    input={(props) => <TextInput {...props} />}
                  />
                </div>
                <div className="testCol2">
                  <FormikFormField
                    name="parameters.canaryresultscore"
                    label="Canary Result Score"
                    help={<HelpField id="opsmx.testVerification.canaryResultScore" />}
                    input={(props) => <TextInput {...props} />}
                  />
                </div>
                <div className="testCol3" style={{ paddingLeft: '6em' }}>
                  <FormikFormField
                    name="parameters.log"
                    label="Log Analysis"
                    help={<HelpField id="opsmx.testVerification.logAnalysis" />}
                    input={(props) => <RadioButtonInput {...props} inline={true} options={ANALYSIS_TYPE_OPTIONS} />}
                  />
                </div>
              </div>
              <HorizontalRule />
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.baselinestarttime"
                  label="Baseline StartTime"
                  help={<HelpField id="opsmx.testVerification.baselineStartTime" />}
                  input={(props) => <DateTimePicker {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.canarystarttime"
                  label="Canary StartTime"
                  help={<HelpField id="opsmx.testVerification.canaryStartTime" />}
                  input={(props) => <DateTimePicker {...props} />}
                />
              </div>
              <HorizontalRule />
              <div className="grid grid-span-4">
                <div className="testCol1">
                  <FormikFormField
                    name="parameters.testrunkey"
                    label="Test Run Key"
                    help={<HelpField id="opsmx.testVerification.testRunKey" />}
                    input={(props) => <TextInput {...props} />}
                  />
                </div>
                <div className="testCol2">
                  <FormikFormField
                    name="parameters.baselinetestrunid"
                    label="Baseline Test Run Id"
                    help={<HelpField id="opsmx.testVerification.baselineTestRunId" />}
                    input={(props) => <TextInput {...props} />}
                  />
                </div>
                <div className="testCol3">
                  <FormikFormField
                    name="parameters.newtestrunid"
                    label="New Test Run Id"
                    help={<HelpField id="opsmx.testVerification.newTestRunId" />}
                    input={(props) => <TextInput {...props} />}
                  />
                </div>
              </div>
              <div className="grid-span-4 TestRunTextareaMain">
                <FormikFormField
                  name="parameters.testruninfo"
                  label="Test Run Info"
                  help={<HelpField id="opsmx.testVerification.testRunInfo" />}
                  input={(props) => <textarea className="TestRunTextArea" {...props}></textarea>}
                />
              </div>
              <HorizontalRule />
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.gate"
                  label="Gate Name"
                  help={<HelpField id="opsmx.testVerification.gateName" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.imageids"
                  label="Image Ids"
                  help={<HelpField id="opsmx.testVerification.imageIds" />}
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
    .field('parameters.gateurl')
    .required()
    .withValidators((value, label) => (value = '' ? `Gate Url is required` : undefined));

  validator
    .field('parameters.lifetime')
    .required()
    .withValidators((value, label) => (value = '' ? `LifeTimeHours is required` : undefined));

  validator
    .field('parameters.minicanaryresult')
    .required()
    .withValidators((value, label) => (value = '' ? `Minimum Canary Result is required` : undefined));

  validator
    .field('parameters.canaryresultscore')
    .required()
    .withValidators((value, label) => (value = '' ? `Canary Result Score is required` : undefined));

  validator
    .field('parameters.log')
    .required()
    .withValidators((value, label) => (value = '' ? `Log Analysis is required` : undefined));

  validator
    .field('parameters.gate')
    .required()
    .withValidators((value, label) => (value = '' ? `Gate Name is required` : undefined));

  validator
    .field('parameters.imageids')
    .required()
    .withValidators((value, label) => (value = '' ? `Image Ids is required` : undefined));

  validator.field('parameters.baselinestarttime').required();

  validator.field('parameters.canarystarttime').required();

  return validator.validateForm();
}
