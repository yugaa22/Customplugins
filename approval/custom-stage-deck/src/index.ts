import { IDeckPlugin } from '@spinnaker/core';
import { approval } from './VisibilityApproval';
import { initialize } from './initialize';

export const plugin: IDeckPlugin = {
  initialize,
  stages: [approval],
};
