import { IDeckPlugin } from '@spinnaker/core';
import { customTSApplyJobStage } from './TerraformApplyGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [customTSApplyJobStage],

};
