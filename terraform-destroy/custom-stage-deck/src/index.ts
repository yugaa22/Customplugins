import { IDeckPlugin } from '@spinnaker/core';
import { customTSDestroyJobStage } from './TerraformDestroyGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [customTSDestroyJobStage],
};
