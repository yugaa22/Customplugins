import React from 'react';
import { ExecutionDetailsTasks, IStageTypeConfig } from '@spinnaker/core';

import { TerraformApplyGateExecutionDetails } from './TerraformApplyGateExecutionDetails';
import { TerraformApplyGateConfig, validate } from './TerraformApplyGateConfig';

/*
  Define Spinnaker Stages with IStageTypeConfig.
  Required options: https://github.com/spinnaker/deck/master/app/scripts/modules/core/src/domain/IStageTypeConfig.ts
  - label -> The name of the Stage
  - description -> Long form that describes what the Stage actually does
  - key -> A unique name for the Stage in the UI; ties to Orca backend
  - component -> The rendered React component
  - validateFn -> A validation function for the stage config form.
 */
export const terraformapply: IStageTypeConfig = {
  key: 'terraformapply',
  label: `Terraform Apply`,
  description: 'Custom stage to create resources using terraform',
  component: TerraformApplyGateConfig, // stage config
  executionDetailsSections: [TerraformApplyGateExecutionDetails, ExecutionDetailsTasks],
  supportsCustomTimeout: true,
  validateFn: validate,
};
