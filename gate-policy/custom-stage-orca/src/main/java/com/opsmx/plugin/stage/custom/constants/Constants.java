package com.opsmx.plugin.stage.custom.constants;

public interface Constants {

    String GET_APPDETAILS_URL = "/platformservice/v1/applications/{applicationName}/pipelines/{pipelineName}?gateSearch=true";

    String CREATE_GATE_URL = "/dashboardservice/v4/pipelines/{pipelineId}/gates";

    String X_SPINNAKER_USER = "x-spinnaker-user";

    String PLUGIN_NAME = "OpsMxPolicyStagePlugin";
}
