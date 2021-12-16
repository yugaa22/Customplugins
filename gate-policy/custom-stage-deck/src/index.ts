import { IDeckPlugin } from '@spinnaker/core';
import { policy } from './PolicyGate';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [policy],
};
