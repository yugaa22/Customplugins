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
  IFormikStageConfigInjectedProps,
} from '@spinnaker/core';
import './Verification.less';
import { DateTimePicker } from './input/DateTimePickerInput';

/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `maxWaitTime` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */

const HorizontalRule = () => (
  <div className="grid-span-4">
    <hr />
  </div>
);



export function VerificationConfig(props: IStageConfigProps) {

  if(!props.stage.parameters.hasOwnProperty('canaryRealTime')){
    props.stage.parameters.canaryRealTime = false;
  }
  if(!props.stage.parameters.hasOwnProperty('baselineRealTime')){
    props.stage.parameters.baselineRealTime = false;
  }
  const ANALYSIS_TYPE_OPTIONS: any = [
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' },
  ];

  const onCheckBaselineRealTimeCheckbox = (e:any, formik: any) => { 
    console.log("oncheck baseline");
    console.log(formik);
    props.stage.parameters.baselineRealTime = e.target.checked;
    formik.setFieldValue('parameters.baselineRealTime', e.target.checked);
    props.stage.parameters.baselineStartTime = null;
  }; 
  
  const onCheckCanaryRealTimeCheckbox = (e:any, formik: any) => { 
    props.stage.parameters.canaryRealTime = e.target.checked;
    formik.setFieldValue('parameters.canaryRealTime', e.target.checked);
    props.stage.parameters.canarystarttime = null;
  };

  return (
    <div className="VerificationGateConfig">
      <FormikStageConfig
        {...props}
        onChange={props.updateStage}
        render={({ formik }: IFormikStageConfigInjectedProps) => (
          <div className="flex">
            <div className="grid"></div>
            <div className="grid grid-4 form mainform">
              <div className="grid-span-3">
                <FormikFormField
                  name="parameters.gateurl"
                  label="Gate Url"
                  help={<HelpField id="opsmx.verification.gateUrl" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div>
                <FormikFormField
                  name="parameters.lifetime"
                  label="LifeTimeHours"
                  help={<HelpField id="opsmx.verification.lifeTimeHours" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <HorizontalRule />
              <div>
                <FormikFormField
                  name="parameters.minicanaryresult"
                  label="Minimum Canary Result"
                  help={<HelpField id="opsmx.verification.minimumCanaryResult" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div>
                <FormikFormField
                  name="parameters.canaryresultscore"
                  label="Canary Result Score"
                  help={<HelpField id="opsmx.verification.canaryResultScore" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div style={{ paddingLeft: '4em' }}>
                <FormikFormField
                  name="parameters.log"
                  label="Log Analysis"
                  help={<HelpField id="opsmx.verification.logAnalysis" />}
                  input={(props) => <RadioButtonInput {...props} inline={true} options={ANALYSIS_TYPE_OPTIONS} />}
                />
              </div>
              <div style={{ paddingLeft: '2em' }}>
                <FormikFormField
                  name="parameters.metric"
                  label="Metric Analysis"
                  help={<HelpField id="opsmx.verification.metricAnalysis" />}
                  input={(props) => <RadioButtonInput {...props} inline={true} options={ANALYSIS_TYPE_OPTIONS} />}
                />
              </div>
              <HorizontalRule />
              <div className="grid-span-2">
                <div>
                <input type="checkbox" checked={props.stage.parameters.baselineRealTime} onChange={(e) => onCheckBaselineRealTimeCheckbox(e, formik)}  /> 
                <span className='automatedSpan'>Real Time</span>
                </div>
                <FormikFormField
                  name="parameters.baselinestarttime"
                  label="Baseline StartTime"
                  help={<HelpField id="opsmx.verification.baselineStartTime" />}
                  input={(props) => <DateTimePicker {...props} />}
                />
              </div>
              <div className="grid-span-2">
              <div>
                <input type="checkbox" checked={props.stage.parameters.canaryRealTime} onChange={(e) => onCheckCanaryRealTimeCheckbox(e, formik)}  /> 
                <span className='automatedSpan'>Real Time</span>
                </div>
                <FormikFormField
                  name="parameters.canarystarttime"
                  label="Canary StartTime"
                  help={<HelpField id="opsmx.verification.canarystarttime" />}
                  input={(props) => <DateTimePicker {...props} />}
                />
              </div>
              <HorizontalRule />
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.gate"
                  label="Gate Name"
                  help={<HelpField id="opsmx.verification.gateName" />}
                  input={(props) => <TextInput {...props} />}
                />
              </div>
              <div className="grid-span-2">
                <FormikFormField
                  name="parameters.imageids"
                  label="Image Ids"
                  help={<HelpField id="opsmx.verification.imageIds" />}
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
    .field('parameters.metric')
    .required()
    .withValidators((value, label) => (value = '' ? `Metric Analysis is required` : undefined));

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
