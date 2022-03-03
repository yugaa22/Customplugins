import { IDeckPlugin } from '@spinnaker/core';
import { terraformdestroy } from './TerraformDestroyGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [terraformdestroy],
};
