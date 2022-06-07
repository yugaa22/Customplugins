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
  HelpContentsRegistry.register('opsmx.policy.policyProxy', 'Please enter the POLICY Proxy Hostname and Port.');
  HelpContentsRegistry.register('opsmx.policy.policyPath', 'Please enter Policy path that applies to this stage.');
  HelpContentsRegistry.register('opsmx.policy.payload', 'You may pass an additional payload for the policy evaluation');
  HelpContentsRegistry.register('opsmx.policy.gateName', 'Please enter Gate.');
  HelpContentsRegistry.register('opsmx.policy.imageIds', 'Please enter the Instance Id');
  HelpContentsRegistry.register('opsmx.policy.policyName', 'Select the policy you want to evaluate. You can manage policies from Setup-> Policies');
  HelpContentsRegistry.register('opsmx.policy.customEnvironment', 'Add new environment');
  HelpContentsRegistry.register('opsmx.policy.environment', 'Select the environment relevant to this stage');  
};
