import { HelpContentsRegistry } from '@spinnaker/core';

/*
  This is a contrived example of how to use an `initialize` function to hook into arbitrary Deck services. 
  This `initialize` function provides the help field text for the `CustomStageConfig` stage form.

  You can hook into any service exported by the `@spinnaker/core` NPM module, e.g.:
   - CloudProviderRegistry
   - DeploymentStrategyRegistry

  When you use a registry, you are diving into Deck's implementation to add functionality. 
  These registries and their methods may change without warning.
*/
export const initialize = () => {
  HelpContentsRegistry.register('opsmx.approval.gateUrl', 'Please enter the Gate URL');
  HelpContentsRegistry.register('opsmx.approval.gateName', 'Please enter Gate Name that is created in OES');
  HelpContentsRegistry.register('opsmx.approval.imageIds', 'Please enter the Instance Id');
  HelpContentsRegistry.register('opsmx.approval.environment', 'Select the environment relevant to this stage');  
  HelpContentsRegistry.register('opsmx.approval.customEnvironment', 'Add new environment');
  HelpContentsRegistry.register('opsmx.approval.automatedApproval', 'Automatically approve the deployment based on preconfigured conditions');
  HelpContentsRegistry.register('opsmx.approval.approvalCondition', 'You can manage conditions from Setup-> Policies');
  HelpContentsRegistry.register('opsmx.approval.approverGroup', 'The list of user groups who can approve the request');
 
};
