import { IDeckPlugin } from '@spinnaker/core';
import { terraform } from './TerraformGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [terraform],
};
