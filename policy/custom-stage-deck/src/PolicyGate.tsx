import React from 'react';
import { ExecutionDetailsTasks, IStageTypeConfig } from '@spinnaker/core';

import { PolicyGateExecutionDetails } from './PolicyGateExecutionDetails';
import { PolicyGateConfig, validate } from './PolicyGateConfig';

/*
  Define Spinnaker Stages with IStageTypeConfig.
  Required options: https://github.com/spinnaker/deck/master/app/scripts/modules/core/src/domain/IStageTypeConfig.ts
  - label -> The name of the Stage
  - description -> Long form that describes what the Stage actually does
  - key -> A unique name for the Stage in the UI; ties to Orca backend
  - component -> The rendered React component
  - validateFn -> A validation function for the stage config form.
 */
export const policy: IStageTypeConfig = {
  key: 'policy',
  label: `Policy`,
  description: 'Spinnaker Policy Evaluation and Decision Stage',
  component: PolicyGateConfig, // stage config
  executionDetailsSections: [PolicyGateExecutionDetails, ExecutionDetailsTasks],
  supportsCustomTimeout: true,
  validateFn: validate,
};
