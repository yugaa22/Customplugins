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
  ReactSelectInput,
  useData
} from '@spinnaker/core';
import './Verification.less';
import { DateTimePicker } from './input/DateTimePickerInput';
//import { VerificationService } from './Verification.service';
import { REST } from '@spinnaker/core';

/*
  IStageConfigProps defines properties passed to all Spinnaker Stages.
  See IStageConfigProps.ts (https://github.com/spinnaker/deck/blob/master/app/scripts/modules/core/src/pipeline/config/stages/common/IStageConfigProps.ts) for a complete list of properties.
  Pass a JSON object to the `updateStageField` method to add the `maxWaitTime` to the Stage.

  This method returns JSX (https://reactjs.org/docs/introducing-jsx.html) that gets displayed in the Spinnaker UI.
 */

  // const getMetricList(): PromiseLike<any> => {  
  //   return REST("autopilot/api/v1/applications/81/metricTemplates").path().get();
  // }
  
  // const getLogTemplateList() : PromiseLike<any> => {  
  //   return REST("autopilot/api/v1/applications/6/logTemplates").path().get();
  // }

const HorizontalRule = () => (
  <div className="grid-span-4">
    <hr />
  </div>
);

// let metricDropdownList = function getMetricList(): PromiseLike<any> {
//   return REST('autopilot/api/v1/applications/7/logTemplates').
//   get()
//   .then(
//     function (results) {
//       return metricDropdownList = results['logTemplates'].map((template : any) => ({
//         label : template.templateName,
//         value : template.templateName}));
//     },
//     function () {
//       return [];
//     },
//   );
// };

const fetchMetricList = () => {
  return REST('autopilot/api/v1/applications/7/logTemplates').
  get()
    .then((results) => {
      // const allDimensions = flatMap(results, (r) => r.dimensions);
      // const sortedDimensions = uniq(allDimensions.filter((d) => d).map((d) => d.name)).sort();
      // return sortedDimensions;
      const metricDropdownList = results['logTemplates'].map((template : any) => ({
        label : template.templateName,
        value : template.templateName}));
        return metricDropdownList;
    })
    .catch(() => {
      return [];
    });
};
const { result: metricDropdownList } = useData(fetchMetricList, [], []);

// const metricDropdownList = function getMetricList(): PromiseLike<any> {
//   return REST('autopilot/api/v1/applications/81/metricTemplates').get();
// };


// const metricDropdownList : any = () => {
//   return fetch("https://ui.gitops-test.dev.opsmx.net/gate/autopilot/api/v1/applications/7/logTemplates")
//     .then(res => res.json())
//     .then(
//       (result) => {
//         return result.logTemplates;
//       },        
//       (error) => {
//         console.log(error);
//         return [
//                 {
//                   "templateName": "test1"
//                 },
//                 {
//                   "templateName": "test2"
//                 }
//               ];
//       }
//     )
// }



// const metricDropdownList = 
//   {
//     "metricTemplates": [
//       {
//         "templateName": "test1"
//       },
//       {
//         "templateName": "test2"
//       }
//     ]
//   };

const logDropdownList = 
  {
    "logTemplates": [
      {
        "templateName": "test1"
      },
      {
        "templateName": "test2"
      }
    ]
  }
;





export function VerificationConfig(props: IStageConfigProps) {
  const ANALYSIS_TYPE_OPTIONS: any = [
    { label: 'True', value: 'true' },
    { label: 'False', value: 'false' },
  ];

  return (
    <div className="VerificationGateConfig">
      <FormikStageConfig
        {...props}
        onChange={props.updateStage}
        render={() => (
          <div className="flex">
            <div className="grid"></div>
            <div className="grid grid-4 form mainform">
            <div className="grid-span-2">                    
              <FormikFormField
                name="parameters.logTemplate"
                label="Log Template"
                help={<HelpField id="opsmx.verification.logTemplate" />}
                input={(props) => (
                  <ReactSelectInput
                  {...props}
                  clearable={false}
                  // onChange={(o: React.ChangeEvent<HTMLSelectElement>) => {
                  //   ...props.formik.setFieldValue('parameters.logTemplate', o.target.value);
                  // }}
                  //onChange={(e) => setLogTemplate(e.target.value)}
                  options={logDropdownList['logTemplates'] && logDropdownList['logTemplates'].map((template : any) => ({
                    label : template.templateName,
                    value : template.templateName}))} 
                  // options={(getDropdown().result || []).map((s) => ({
                  //   label: s.label,
                  //   value: s.value,
                  // }))}
                  //value={...props}
                  //stringOptions={...props}
                  />
                )}
              />               
            </div>
            <div className="grid-span-2">                    
              <FormikFormField
                name="parameters.metricTemplate"
                label="Metric Template"
                help={<HelpField id="opsmx.verification.metricTemplate" />}
                input={(props) => (
                  <ReactSelectInput
                  {...props}
                  clearable={false}
                 // onChange={(e) => setMetricTemplate(e.target.value)}
                  // onChange={(o: React.ChangeEvent<HTMLSelectElement>) => {
                  //   this.props.formik.setFieldValue('parameters.metricTemplate', o.target.value);
                  // }} 
                  // options={metricDropdownList && metricDropdownList.map((template : any) => ({
                  //   label : template.templateName,
                  //   value : template.templateName}))}
                  // options={metricDropdownList['metricTemplates'] && metricDropdownList['metricTemplates'].map((template : any) => ({
                  //   label : template.templateName,
                  //   value : template.templateName}))}
                  options={metricDropdownList}
                  //value={...props}
                  //stringOptions={...props}
                  />
                )}
              />               
            </div>
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
                <FormikFormField
                  name="parameters.baselinestarttime"
                  label="Baseline StartTime"
                  help={<HelpField id="opsmx.verification.baselineStartTime" />}
                  input={(props) => <DateTimePicker {...props} />}
                />
              </div>
              <div className="grid-span-2">
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
