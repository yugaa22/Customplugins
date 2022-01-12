import { IDeckPlugin } from '@spinnaker/core';
import { terraformapply } from './TerraformApplyGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [terraformapply],
};
