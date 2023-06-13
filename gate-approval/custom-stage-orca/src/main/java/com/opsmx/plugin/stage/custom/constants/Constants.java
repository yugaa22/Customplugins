package com.opsmx.plugin.stage.custom.constants;

public interface Constants {

    String GET_APPDETAILS_URL = "/platformservice/v1/applications/{applicationName}/pipelines/{pipelineName}?gateSearch=true";

    String CREATE_GATE_URL = "/dashboardservice/v4/pipelines/{pipelineId}/gates";

    String UPDATE_USER_GROUP_URL = "/platformservice/v6/usergroups/permissions/users/{username}/resources/{resourceId}";

    String UPDATE_TOOL_CONNECTOR_URL = "/visibilityservice/v4/approvalGates/{id}/connector";

    String UPDATE_GATE_URL = "/dashboardservice/v4/pipelines/{pipelineId}/gates/{gateId}";

    String X_SPINNAKER_USER = "x-spinnaker-user";

    String PLUGIN_NAME = "OpsMxApprovalStagePlugin";
}
