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
  HelpContentsRegistry.register('opsmx.verification.lifeTimeHours', 'Hours to let the analysis run before making a final determination.');
  HelpContentsRegistry.register('opsmx.verification.minimumCanaryResult', 'Please enter the Minimum Canary Result');
  HelpContentsRegistry.register('opsmx.verification.canaryResultScore', 'Please enter the Canry Result Score');
  HelpContentsRegistry.register('opsmx.verification.logAnalysis', 'Please Enable Log Analysis with true / false');
  HelpContentsRegistry.register('opsmx.verification.metricAnalysis', 'Please Enable Metric Analysis with true / false');
  HelpContentsRegistry.register('opsmx.verification.baselineStartTime', 'Baseline Start Time for the analysis');
  HelpContentsRegistry.register('opsmx.verification.canarystarttime', 'Canary Start Time for the analysis');
  HelpContentsRegistry.register('opsmx.verification.gateName', 'Please enter Gate Name that is created in OES');
  //HelpContentsRegistry.register('opsmx.verification.imageIds', 'Unique Id which represents a pipeline execution; For example, in a k8s deployment pipeline, it is the Image Id');
  HelpContentsRegistry.register('opsmx.verification.logTemplate', 'A collection of all the information needed to run the log analysis');
  HelpContentsRegistry.register('opsmx.verification.metricTemplate', 'Information needed to run the metric analysis');
  HelpContentsRegistry.register('opsmx.verification.environment', 'Environment in which the Analysis will run');  
  HelpContentsRegistry.register('opsmx.verification.customEnvironment', 'Add New Environment');
  HelpContentsRegistry.register('opsmx.verification.canaryRealTime', 'Start time of stage execution will be taken as Canary Start time');
  HelpContentsRegistry.register('opsmx.verification.baselineRealTime', 'Start time of stage execution will be taken as Baseline Start time');  
  HelpContentsRegistry.register('opsmx.verification.marginalScore', 'If the score is equal to or higher than the Marginal but lower than the Pass Score, “Review” status is shown in the Analysis screen'); 
  HelpContentsRegistry.register('opsmx.verification.passScore', 'If the Score equal to or higher than Pass Score, the stage will Pass');
};
