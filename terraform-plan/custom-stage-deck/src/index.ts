import { IDeckPlugin } from '@spinnaker/core';
import { customTSPlanJobStage } from './TerraformPlanGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [customTSPlanJobStage],
};
