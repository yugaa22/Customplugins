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
  HelpContentsRegistry.register('opsmx.terraformapply.AWSAccountName', 'Please enter the AWS Account Name.');
  HelpContentsRegistry.register('opsmx.terraformapply.spinnakerNamespace', 'Please enter Spinnaker Namespace.');
  HelpContentsRegistry.register('opsmx.terraformapply.tfScriptAccount', 'Please enter the Terraform Script Account.');
  HelpContentsRegistry.register('opsmx.terraformapply.tfScriptRepo', 'Please enter Terraform Script Repository.');
  HelpContentsRegistry.register('opsmx.terraformapply.tfLocation', 'Please enter the Terraform Location.');
  HelpContentsRegistry.register('opsmx.terraformapply.overrideFile', 'Please enter Override file.');
  HelpContentsRegistry.register('opsmx.terraformapply.tfStateAccount', 'Please enter Teraform State Account.');
  HelpContentsRegistry.register('opsmx.terraformapply.artifactRepo', 'Please enter Artifact Repository.');
  HelpContentsRegistry.register('opsmx.terraterraformapplyform.artifactUUID', 'Please enter Artifact UUID.');
};
