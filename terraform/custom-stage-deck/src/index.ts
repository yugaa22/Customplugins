import { IDeckPlugin } from '@spinnaker/core';
import { verification } from './Verification';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [verification],
};
