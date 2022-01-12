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
  HelpContentsRegistry.register('opsmx.terraformdestroy.AWSAccountName', 'Please enter the AWS Account Name.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.spinnakerNamespace', 'Please enter Spinnaker Namespace.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.tfScriptAccount', 'Please enter the Terraform Script Account.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.tfScriptRepo', 'Please enter Terraform Script Repository.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.tfLocation', 'Please enter the Terraform Location.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.overrideFile', 'Please enter Override file.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.tfStateAccount', 'Please enter Teraform State Account.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.artifactRepo', 'Please enter Artifact Repository.');
  HelpContentsRegistry.register('opsmx.terraformdestroy.artifactUUID', 'Please enter Artifact UUID.');
};
