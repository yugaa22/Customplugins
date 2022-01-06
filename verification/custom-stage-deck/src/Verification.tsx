import React from 'react';
import { ExecutionDetailsTasks, IStageTypeConfig } from '@spinnaker/core';

import { VerificationExecutionDetails } from './VerificationExecutionDetails';
import { VerificationConfig, validate } from './VerificationConfig';

/*
  Define Spinnaker Stages with IStageTypeConfig.
  Required options: https://github.com/spinnaker/deck/master/app/scripts/modules/core/src/domain/IStageTypeConfig.ts
  - label -> The name of the Stage
  - description -> Long form that describes what the Stage actually does
  - key -> A unique name for the Stage in the UI; ties to Orca backend
  - component -> The rendered React component
  - validateFn -> A validation function for the stage config form.
 */
export const verification: IStageTypeConfig = {
  key: 'verification',
  label: `Verification`,
  description: 'Stage for Verification Gate',
  component: VerificationConfig, // stage config
  executionDetailsSections: [VerificationExecutionDetails, ExecutionDetailsTasks],
  supportsCustomTimeout: true,
  validateFn: validate,
};
