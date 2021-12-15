import { IDeckPlugin } from '@spinnaker/core';
import { testVerification } from './TestVerification';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [testVerification],
};
