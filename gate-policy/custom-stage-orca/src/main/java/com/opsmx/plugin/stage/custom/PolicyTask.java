package com.opsmx.plugin.stage.custom;

import java.io.IOException;
import java.util.*;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import org.apache.commons.lang3.StringUtils;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
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
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.Lists;
import com.netflix.spinnaker.kork.plugins.api.PluginComponent;
import com.netflix.spinnaker.orca.api.pipeline.Task;
import com.netflix.spinnaker.orca.api.pipeline.TaskResult;
import com.netflix.spinnaker.orca.api.pipeline.models.ExecutionStatus;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;

import jline.internal.Log;
import org.springframework.beans.factory.annotation.Value;

@Extension
@PluginComponent
public class PolicyTask implements Task {

	@Value("${isd.gate.url:http://oes-gate:8084}")
	private String isdGateUrl;
	
	private static final String PAYLOAD_CONSTRAINT = "payloadConstraint";

	private static final String DENY = "deny";

	private static final String ALLOW = "allow";

	private static final String EXECUTED_BY = "executedBy";

	private static final String MESSAGE = "message";

	private static final String STATUS = "status";

	private static final String TRIGGER_JSON = "trigger_json";

	private static final String USER2 = "user";

	private static final String TRIGGER = "trigger";

	private static final String NAME2 = "name";

	private static final String APPLICATION2 = "application";

	private static final String START_TIME = "startTime";

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ObjectMapper objectMapper = new ObjectMapper();

	private final Gson gson = new Gson();

	public PolicyTask() {
	}

	@NotNull
	@Override
	public TaskResult execute(@NotNull StageExecution stage) {

		Map<String, Object> contextMap = new HashMap<>();
		Map<String, Object> outputs = new HashMap<>();
		logger.info("Policy gate execution start ");

		String triggerUrl = getTriggerURL(stage, outputs);
		if (triggerUrl == null) {
			return TaskResult.builder(ExecutionStatus.TERMINAL)
					.context(contextMap)
					.outputs(outputs)
					.build();
		}

		return verifyPolicy(stage, outputs, contextMap, triggerUrl);
	}

	private TaskResult verifyPolicy(StageExecution stage, Map<String, Object> outputs, Map<String, Object> contextMap, String triggerUrl) {
		CloseableHttpClient httpClient = HttpClients.createDefault();
		try {
			HttpPost request = new HttpPost(triggerUrl);
			String triggerPayload = getPayloadString(stage, outputs);
			outputs.put(TRIGGER_JSON, String.format("Payload json - %s", triggerPayload));
			request.setEntity(new StringEntity(triggerPayload));
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", stage.getExecution().getAuthentication().getUser());

			CloseableHttpResponse response = httpClient.execute(request);

			HttpEntity entity = response.getEntity();
			String registerResponse = "";
			if (entity != null) {
				registerResponse = EntityUtils.toString(entity);
			}

			logger.debug("Policy trigger application : {}, pipeline : {},  response : {}",
					stage.getExecution().getApplication(), stage.getExecution().getName(), registerResponse);

			if (response.getStatusLine().getStatusCode() == 200 ) {
				StringBuilder message = new StringBuilder();
				JsonObject opaResponse = gson.fromJson(registerResponse, JsonObject.class);
				extractDenyMessage(opaResponse, message, ALLOW);
				outputs.put(STATUS, ALLOW);
				outputs.put(MESSAGE, message.toString());
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return TaskResult.builder(ExecutionStatus.SUCCEEDED)
						.context(contextMap)
						.outputs(outputs)
						.build();

			} else  if (response.getStatusLine().getStatusCode() == 401 ) {
				StringBuilder message = new StringBuilder();
				JsonObject opaResponse = gson.fromJson(registerResponse, JsonObject.class);
				extractDenyMessage(opaResponse, message, DENY);
				outputs.put(STATUS, DENY);
				outputs.put(MESSAGE, message.toString());
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();

			} else {
				outputs.put(STATUS, DENY);
				outputs.put("REASON", String.format("Policy validation status code :: %s, %s", response.getStatusLine().getStatusCode(), registerResponse));
				outputs.put(MESSAGE, String.format("Policy validation failed :: %s", registerResponse));
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}
		} catch (Exception e) {
			logger.error("Error occurred while triggering policy ", e);
			outputs.put(STATUS, DENY);
			outputs.put(MESSAGE, String.format("Policy validation trigger failed with exception :: %s", e.getMessage()));
			outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
			return TaskResult.builder(ExecutionStatus.TERMINAL)
					.context(contextMap)
					.outputs(outputs)
					.build();
		} finally {
			if (httpClient != null) {
				try {
					httpClient.close();
				} catch (IOException e) {}
			}
		}
	}

	private String getPayloadString(StageExecution stage, Map<String, Object> outputs) throws JsonProcessingException {
		ObjectNode finalJson = objectMapper.createObjectNode();

		Object payloadContext = ((Map<String, Object>) stage.getContext().get("parameters")).get("payload");
		Map<String, Object> parameterContext = (Map<String, Object>) stage.getContext().get("parameters");
		if (parameterContext.get("policyName") != null) {
			outputs.put("policyName", (String) parameterContext.get("policyName"));
		}
		String payload = "";
		if (payloadContext != null) {
			if (payloadContext instanceof String) {
				payload = (String) payloadContext;
			} else {
				payload = objectMapper.writeValueAsString(
						objectMapper.convertValue((Map<String, Object>) ((Map<String, Object>) stage.getContext().get("parameters")).get("payload"), ObjectNode.class));
			}
		}

		if (payload != null && ! payload.trim().isEmpty()) {
			finalJson = (ObjectNode) objectMapper.readTree(payload);
		}
		finalJson.put(START_TIME, System.currentTimeMillis());
		finalJson.put(APPLICATION2, stage.getExecution().getApplication());
		finalJson.put(NAME2, stage.getExecution().getName());
		finalJson.put("stage", stage.getName());
		finalJson.put("executionId", stage.getExecution().getId());
		finalJson.set(TRIGGER, objectMapper.createObjectNode().put(USER2, stage.getExecution().getAuthentication().getUser()));

		ArrayNode payloadConstraintNode = objectMapper.createArrayNode();
		if (parameterContext.get("gateSecurity") != null) {
			String gateSecurityPayload = objectMapper.writeValueAsString(parameterContext.get("gateSecurity"));
			ArrayNode securityNode = (ArrayNode) objectMapper.readTree(gateSecurityPayload);
			securityNode.forEach(secNode -> {
				ArrayNode valuesNode = (ArrayNode)secNode.get("values");
				for (JsonNode jsonNode : valuesNode) {
					if (jsonNode.has("label") && !jsonNode.get("label").isNull() && !jsonNode.get("label").asText().isBlank()) {
						payloadConstraintNode.add(objectMapper.createObjectNode()
								.put(jsonNode.get("label").asText(), jsonNode.get("value").isNull() ? null : jsonNode.get("value").asText()));
					}
				}
			});
		}
		finalJson.set(PAYLOAD_CONSTRAINT, payloadConstraintNode);

		return objectMapper.writeValueAsString(finalJson);
	}

	private void extractDenyMessage(JsonObject opaResponse, StringBuilder messageBuilder, String key) {
		Set<Map.Entry<String, JsonElement>> fields = opaResponse.entrySet();
		fields.forEach(field -> {
			if (field.getKey().equalsIgnoreCase(key)) {
				JsonArray resultKey = field.getValue().getAsJsonArray();
				if (resultKey.size() != 0) {
					resultKey.forEach(result -> {
						if (StringUtils.isNotEmpty(messageBuilder)) {
							messageBuilder.append(", ");
						}
						messageBuilder.append(result.getAsString());
					});
				}
			}else if (field.getValue().isJsonObject()) {
				if (!field.getValue().isJsonPrimitive()) {
					extractDenyMessage(field.getValue().getAsJsonObject(), messageBuilder, key);
				}
			} else if (field.getValue().isJsonArray()){
				field.getValue().getAsJsonArray().forEach(obj -> {
					if (!obj.isJsonPrimitive()) {
						extractDenyMessage(obj.getAsJsonObject(), messageBuilder, key);
					}
				});
			}
		});
	}

	private String getTriggerURL(StageExecution stage, Map<String, Object> outputs) {

		String triggerEndpoint = constructGateEnpoint(stage);
		CloseableHttpClient httpClient = HttpClients.createDefault();
		try {
			HttpGet request = new HttpGet(triggerEndpoint);
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", stage.getExecution().getAuthentication().getUser());
			CloseableHttpResponse response = httpClient.execute(request);

			HttpEntity entity = response.getEntity();
			String registerResponse = "";
			if (entity != null) {
				registerResponse = EntityUtils.toString(entity);
			}

			logger.debug("STATUS CODE: {}, RESPONSE : {}", response.getStatusLine().getStatusCode(), registerResponse);
			if (response.getStatusLine().getStatusCode() != 200) {
				outputs.put(STATUS, DENY);
				outputs.put("REASON", String.format("Failed to get the trigger url with status code :: %s, %s",
						response.getStatusLine().getStatusCode(), registerResponse));
				outputs.put(MESSAGE, String.format("Failed to get the trigger endpoint with Response :: %s", registerResponse));
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return null;
			}

			ObjectNode readValue = objectMapper.readValue(registerResponse, ObjectNode.class);
			String triggerUrl = readValue.get("gateUrl").isNull() ? null : readValue.get("gateUrl").asText();
			if (triggerUrl == null || triggerUrl.isBlank() || triggerUrl.equalsIgnoreCase("null")) {
				outputs.put(STATUS, DENY);
				outputs.put("REASON", String.format("Failed to get the trigger endpoint with status code :: %s, %s",
						response.getStatusLine().getStatusCode(), registerResponse));
				outputs.put(MESSAGE, "Failed to get trigger endpoint. Please resave the stage before execution");
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return null;
			}
			if (readValue.get("policyUrl") != null ) {
				outputs.put("policyLink", readValue.get("policyUrl").asText());
			}
			return triggerUrl;
		} catch (Exception e) {
			logger.error("Failed to execute policy stage", e);
			outputs.put(STATUS, DENY);
			outputs.put(MESSAGE, String.format("Failed to get the trigger endpoint with exception :: %s", e.getMessage()));
			outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
			return null;
		} finally {
			if (httpClient != null) {
				try {
					httpClient.close();
				} catch (IOException e) {
					logger.warn("exception while closing the connection : {}",
							e.getMessage());
				}
			}
		}
	}

	private String constructGateEnpoint(StageExecution stage) {
		//applications/{applicationname}/pipeline/{pipelineName}/reference/{ref}/gates/{gatesName}?type={gateType}
		return String.format("%s/platformservice/v6/applications/%s/pipeline/%s/reference/%s/gates/%s?type=policy",
				isdGateUrl.endsWith("/") ? isdGateUrl.substring(0, isdGateUrl.length() - 1) : isdGateUrl,
				stage.getExecution().getApplication(), stage.getExecution().getName(), stage.getRefId(),
				stage.getName());
	}
}
