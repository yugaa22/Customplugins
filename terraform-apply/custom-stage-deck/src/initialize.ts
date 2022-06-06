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
  HelpContentsRegistry.register('opsmx.customTSApplyJobStage.tfScriptAccount', 'Please enter the artifact account name from artifactsaccounts.json, Account where you have tf script present');
  HelpContentsRegistry.register('opsmx.customTSApplyJobStage.tfApplyScriptRepo', 'Please enter the Git Repo Account of TF script');
  HelpContentsRegistry.register('opsmx.customTSApplyJobStage.tfLocation', 'Please enter Location of terraform script in the repo');
  HelpContentsRegistry.register('opsmx.customTSApplyJobStage.overrideFile', 'Please enter overrideVariableFile path if you want to override variables');
  HelpContentsRegistry.register('opsmx.customTSApplyJobStage.tfStateAccount', 'Please enter the artifact account where you want to save tf state');
  HelpContentsRegistry.register('opsmx.customTSApplyJobStage.artifactRepo', 'Please enter the location  where you want to save terraform intermediate state like gitrepo, s3bucket');
  HelpContentsRegistry.register('opsmx.customTSApplyJobStage.artifactUUID', 'Please enter a unique artifactid to identify the terraform state');
};
