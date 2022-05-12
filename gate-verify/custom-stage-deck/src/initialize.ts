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
  HelpContentsRegistry.register('opsmx.verification.gateUrl', 'Please enter the Gate URL');
  HelpContentsRegistry.register('opsmx.verification.lifeTimeHours', 'Please enter the Life Time in Hours like 0.5');
  HelpContentsRegistry.register('opsmx.verification.minimumCanaryResult', 'Please enter the Minimum Canary Result');
  HelpContentsRegistry.register('opsmx.verification.canaryResultScore', 'Please enter the Canry Result Score');
  HelpContentsRegistry.register('opsmx.verification.logAnalysis', 'Please Enable Log Analysis with true / false');
  HelpContentsRegistry.register('opsmx.verification.metricAnalysis', 'Please Enable Metric Analysis with true / false');
  HelpContentsRegistry.register('opsmx.verification.baselineStartTime', 'Please select Baseline Start Time');
  HelpContentsRegistry.register('opsmx.verification.canaryStartTime', 'Please select Canry Start Time');
  HelpContentsRegistry.register('opsmx.verification.gateName', 'Please enter Gate Name that is created in OES');
  HelpContentsRegistry.register('opsmx.verification.imageIds', 'Please enter the Image IDs');
  HelpContentsRegistry.register('opsmx.verification.logTemplate', 'A collection of all the information needed to run the log analysis');
  HelpContentsRegistry.register('opsmx.verification.metricTemplate', 'Information needed to run the metric analysis');
  HelpContentsRegistry.register('opsmx.verification.environment', 'Specify Environment for this Gate');  
};
