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
  HelpContentsRegistry.register('opsmx.testVerification.gateUrl', 'Please enter the Gate URL');
  HelpContentsRegistry.register('opsmx.testVerification.lifeTimeHours', 'Please enter the Life Time in Hours like 0.5');
  HelpContentsRegistry.register('opsmx.testVerification.minimumCanaryResult', 'Please enter the Minimum Canary Result');
  HelpContentsRegistry.register('opsmx.testVerification.canaryResultScore', 'Please enter the Canry Result Score');
  HelpContentsRegistry.register('opsmx.testVerification.logAnalysis', 'Please Enable Log Analysis with true / false');
  HelpContentsRegistry.register('opsmx.testVerification.baselineStartTime', 'Please select Baseline Start Time');
  HelpContentsRegistry.register('opsmx.testVerification.canaryStartTime', 'Please select Canry Start Time');
  HelpContentsRegistry.register('opsmx.testVerification.testRunKey', 'Please enter the Test Run Key');
  HelpContentsRegistry.register('opsmx.testVerification.baselineTestRunId', 'Please enter the Baseline Test Run Id');
  HelpContentsRegistry.register('opsmx.testVerification.newTestRunId', 'Please enter the New Test Run Id');
  HelpContentsRegistry.register('opsmx.testVerification.testRunInfo', 'Please enter the Test Run Info');
  HelpContentsRegistry.register('opsmx.testVerification.gateName', 'Please enter Gate Name that is created in OES');
  HelpContentsRegistry.register('opsmx.testVerification.imageIds', 'Please enter the Image IDs');
};
