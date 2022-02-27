import { IDeckPlugin } from '@spinnaker/core';
import { terraformplan } from './TerraformPlanGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [terraformplan],
};
