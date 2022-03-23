package com.opsmx.plugin.stage.custom;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.jetbrains.annotations.NotNull;
import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.spinnaker.kork.plugins.api.PluginComponent;
import com.netflix.spinnaker.orca.api.pipeline.Task;
import com.netflix.spinnaker.orca.api.pipeline.TaskResult;
import com.netflix.spinnaker.orca.api.pipeline.models.ExecutionStatus;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;

@Extension
@PluginComponent
public class VerificationTriggerTask implements Task {

	private static final String METRIC = "metric";

	private static final String LOG = "log";

	private static final String SERVICE_GATE = "serviceGate";

	private static final String PIPELINE_NAME = "pipelineName";

	private static final String MINIMUM_CANARY_RESULT_SCORE = "minimumCanaryResultScore";

	private static final String CANARY_CONFIG = "canaryConfig";

	private static final String CANARY_ID = "canaryId";
	
	private static final String PAYLOAD_CONSTRAINT = "payloadConstraint";

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ObjectMapper objectMapper = new ObjectMapper();

	@NotNull
	@Override
	public TaskResult execute(@NotNull StageExecution stage) {

		Map<String, Object> contextMap = new HashMap<>();
		Map<String, Object> outputs = new HashMap<>();

		logger.info(" VerificationGateStage execute start ");
		VerificationContext context = stage.mapTo("/parameters", VerificationContext.class);
		if (context.getGateurl() == null || context.getGateurl().isEmpty()) {
			logger.info("Gate Url should not be empty");
			outputs.put(OesConstants.REASON, "Gate Url should not be empty");
			outputs.put(OesConstants.OVERALL_SCORE, 0.0);
			outputs.put(OesConstants.OVERALL_RESULT, "Fail");
			outputs.put(OesConstants.TRIGGER, OesConstants.FAILED);
			return TaskResult.builder(ExecutionStatus.TERMINAL)
					.context(contextMap)
					.outputs(outputs)
					.build();
		}

		logger.info("Application name : {}, Service name : {}", stage.getExecution().getApplication(), stage.getExecution().getName());
		
		try {

			HttpPost request = new HttpPost(context.getGateurl());
			String triggerPayload = getPayloadString(stage.getExecution().getApplication(), stage.getExecution().getName(), context,
					stage.getExecution().getAuthentication().getUser(), stage.getExecution().getId(), stage.getContext().get(PAYLOAD_CONSTRAINT));
			outputs.put("trigger_json", String.format("Payload Json - %s", triggerPayload));
			request.setEntity(new StringEntity(triggerPayload));
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", stage.getExecution().getAuthentication().getUser());
			
			CloseableHttpClient httpClient = HttpClients.createDefault();
			CloseableHttpResponse response = httpClient.execute(request);

			HttpEntity entity = response.getEntity();
			String registerResponse = "";
			if (entity != null) {
				registerResponse = EntityUtils.toString(entity);
			}
			
			logger.info("Verification trigger response : {}, User : {}", registerResponse, stage.getExecution().getAuthentication().getUser());

			if (response.getStatusLine().getStatusCode() != 202) {
				outputs.put(OesConstants.EXCEPTION, String.format("Failed to trigger request with Status code : %s and Response : %s", 
						response.getStatusLine().getStatusCode(), registerResponse));
				outputs.put(OesConstants.OVERALL_SCORE, 0.0);
				outputs.put(OesConstants.OVERALL_RESULT, "Fail");
				outputs.put(OesConstants.TRIGGER, OesConstants.FAILED);
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}

			ObjectNode readValue = objectMapper.readValue(registerResponse, ObjectNode.class);
			String canaryId = readValue.get(CANARY_ID).asText();

			if (canaryId == null || canaryId.isEmpty()) {
				outputs.put(OesConstants.EXCEPTION, "Something went wrong while triggering registry analysis");
				outputs.put(OesConstants.OVERALL_SCORE, 0.0);
				outputs.put(OesConstants.OVERALL_RESULT, "Fail");
				outputs.put(OesConstants.TRIGGER, OesConstants.FAILED);
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}

			String canaryUrl = response.getLastHeader(OesConstants.LOCATION).getValue();
			logger.info("Analysis autopilot link : {}", canaryUrl);
			
			outputs.put(OesConstants.LOCATION, canaryUrl);
			outputs.put(OesConstants.TRIGGER, OesConstants.SUCCESS);

			return TaskResult.builder(ExecutionStatus.SUCCEEDED)
					.context(contextMap)
					.outputs(outputs)
					.build();

		} catch (Exception e) {
			logger.error("Failed to execute verification gate", e);
			outputs.put(OesConstants.EXCEPTION, String.format("Error occurred while processing, %s", e));
			outputs.put(OesConstants.OVERALL_SCORE, 0.0);
			outputs.put(OesConstants.OVERALL_RESULT, "Fail");
			outputs.put(OesConstants.TRIGGER, OesConstants.FAILED);
			return TaskResult.builder(ExecutionStatus.TERMINAL)
					.context(contextMap)
					.outputs(outputs)
					.build();
		}
	}

	private String getPayloadString(String applicationName, String pipelineName, VerificationContext context,
			String user, String executionId, Object gateSecurity) throws JsonProcessingException  {

		ObjectNode finalJson = objectMapper.createObjectNode();
		finalJson.put("application", applicationName);
		finalJson.put("isJsonResponse", true);
		finalJson.put("executionId", executionId);
		ArrayNode imageIdsNode = objectMapper.createArrayNode();
		String imageIds = context.getImageids();
		if (imageIds != null && ! imageIds.isEmpty()) {
			Arrays.asList(imageIds.split(",")).forEach(tic -> {
				imageIdsNode.add(tic.trim());
			});
		}
		finalJson.set("imageIds", imageIdsNode);
		if (gateSecurity != null) {
			String gateSecurityPayload = objectMapper.writeValueAsString(gateSecurity);
			finalJson.set(PAYLOAD_CONSTRAINT, objectMapper.readTree(gateSecurityPayload));
		}
		
		ObjectNode canaryConfig = objectMapper.createObjectNode();
		canaryConfig.put("lifetimeHours", context.getLifetime());
		canaryConfig.set("canaryHealthCheckHandler", objectMapper.createObjectNode().put(MINIMUM_CANARY_RESULT_SCORE, context.getMinicanaryresult()));
		canaryConfig.set("canarySuccessCriteria", objectMapper.createObjectNode().put("canaryResultScore", context.getCanaryresultscore()));
		canaryConfig.put("name", user);

		ObjectNode baselinePayload = objectMapper.createObjectNode();
		ObjectNode canaryPayload = objectMapper.createObjectNode();
		if (context.getLog().equals(Boolean.TRUE)) {
			baselinePayload.set(LOG, 
					objectMapper.createObjectNode().set(pipelineName, 
							objectMapper.createObjectNode()
							.put(PIPELINE_NAME, pipelineName)
							.put(SERVICE_GATE, context.getGate())));
			canaryPayload.set(LOG, 
					objectMapper.createObjectNode().set(pipelineName, 
							objectMapper.createObjectNode()
							.put(PIPELINE_NAME, pipelineName)
							.put(SERVICE_GATE, context.getGate())));
		}

		if (context.getMetric().equals(Boolean.TRUE)) {
			baselinePayload.set(METRIC, 
					objectMapper.createObjectNode().set(pipelineName, 
							objectMapper.createObjectNode()
							.put(PIPELINE_NAME, pipelineName)
							.put(SERVICE_GATE, context.getGate())));
			canaryPayload.set(METRIC, 
					objectMapper.createObjectNode().set(pipelineName, 
							objectMapper.createObjectNode()
							.put(PIPELINE_NAME, pipelineName)
							.put(SERVICE_GATE, context.getGate())));
		}

		ObjectNode triggerPayload = objectMapper.createObjectNode();
		triggerPayload.set("baseline", baselinePayload);
		triggerPayload.set("canary", canaryPayload);

		ArrayNode payloadTriggerNode = objectMapper.createArrayNode();
		payloadTriggerNode.add(triggerPayload);
		triggerPayload.put("baselineStartTimeMs", context.getBaselinestarttime());
		triggerPayload.put("canaryStartTimeMs", context.getCanarystarttime());

		finalJson.set(CANARY_CONFIG, canaryConfig);
		finalJson.set("canaryDeployments", payloadTriggerNode);
		String finalPayloadString = objectMapper.writeValueAsString(finalJson);
		logger.debug("Payload string to trigger analysis : {}", finalPayloadString);
		return finalPayloadString;
	}
}
