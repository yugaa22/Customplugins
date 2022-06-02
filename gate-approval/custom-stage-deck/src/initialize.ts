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
  HelpContentsRegistry.register('opsmx.approval.imageIds', 'Please enter the Image IDs');
  HelpContentsRegistry.register('opsmx.approval.environment', 'Specify Environment for this Gate');  
  HelpContentsRegistry.register('opsmx.approval.customEnvironment', 'Add new environment');
  HelpContentsRegistry.register('opsmx.approval.automatedApproval', 'Automated approval');
  HelpContentsRegistry.register('opsmx.approval.approvalCondition', 'Specify the approval condition');
  HelpContentsRegistry.register('opsmx.approval.approverGroup', 'Approver group');
 
};
