package com.opsmx.plugin.stage.custom;

public final class OesConstants {
	
	public static final String OVERALL_RESULT = "overallResult";
	
	public static final String OVERALL_SCORE = "overallScore";
	
	public static final String STATUS = "status";
	
	public static final String CANARY_REPORTURL = "canaryReportURL";
	
	public static final String FAILED = "FAILED";

	public static final String SUCCESS = "SUCCESS";

	public static final String TRIGGER = "trigger";
	
	public static final String LOCATION = "location";

	public static final String EXCEPTION = "exception";
	
	public static final String RUNNING = "RUNNING";

	public static final String COMMENT = "comment";
	
	public static final String CANCELLED = "CANCELLED";
	
	public static final String CANARY_RESULT = "canaryResult";
	
	public static final String REASON = "reason";
	
	public static final String CANARY_CONFIG = "canaryConfig";
	
	public static final String MINIMUM_CANARY_RESULT_SCORE = "minimumCanaryResultScore";

	public static final String MAXIMUM_CANARY_RESULT_SCORE = "maximumCanaryResultScore";
	
	public static final String REVIEW = "REVIEW";

	public static final String FAIL = "FAIL";

	public static final String GET_APPDETAILS_URL = "/platformservice/v1/applications/{applicationName}/pipelines/{pipelineName}?gateSearch=true";

	public static final String CREATE_GATE_URL = "/dashboardservice/v4/pipelines/{pipelineId}/gates";

	public static final String X_SPINNAKER_USER = "x-spinnaker-user";

	public static final String PLUGIN_NAME = "OpsMxVerificationStagePlugin";
}
