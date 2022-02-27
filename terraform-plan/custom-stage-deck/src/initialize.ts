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
  HelpContentsRegistry.register('opsmx.terraformplan.AWSAccountName', 'Please enter the AWS Account Name.');
  HelpContentsRegistry.register('opsmx.terraformplan.spinnakerNamespace', 'Please enter Spinnaker Namespace.');
  HelpContentsRegistry.register('opsmx.terraformplan.tfScriptAccount', 'Please enter the Terraform Script Account.');
  HelpContentsRegistry.register('opsmx.terraformplan.tfPlanScriptRepo', 'Please enter Terraform Script Repository.');
  HelpContentsRegistry.register('opsmx.terraformplan.tfLocation', 'Please enter the Terraform Location.');
  HelpContentsRegistry.register('opsmx.terraformplan.overrideFile', 'Please enter Override file.');
  HelpContentsRegistry.register('opsmx.terraformplan.tfStateAccount', 'Please enter Teraform State Account.');
  HelpContentsRegistry.register('opsmx.terraformplan.artifactRepo', 'Please enter Artifact Repository.');
  HelpContentsRegistry.register('opsmx.terraformplan.artifactUUID', 'Please enter Artifact UUID.');
};
