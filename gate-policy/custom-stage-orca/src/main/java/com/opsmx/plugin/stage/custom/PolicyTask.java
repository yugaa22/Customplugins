package com.opsmx.plugin.stage.custom;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang3.StringUtils;
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

@Extension
@PluginComponent
public class PolicyTask implements Task {
	
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

	private static final String EXCEPTION = "exception";

	@Autowired
	private ObjectMapper objectMapper = new ObjectMapper();

	public PolicyTask() {
	}


	@NotNull
	@Override
	public TaskResult execute(@NotNull StageExecution stage) {

		Map<String, Object> contextMap = new HashMap<>();
		Map<String, Object> outputs = new HashMap<>();
		logger.info("Policy gate execution start ");

		CloseableHttpClient httpClient = null;
		try {
			Map<String, Object> jsonContext = (Map<String, Object>) stage.getContext().get("parameters");

			if (jsonContext.get("policyurl") == null || ((String) jsonContext.get("policyurl")).isEmpty()) {
				logger.info("Policyproxy Url should not be empty");
				outputs.put(EXCEPTION, "Policyproxy Url should not be empty");
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}

			PolicyContext context = new PolicyContext();
			context.setPolicyurl(((String) jsonContext.get("policyurl")));
			context.setPolicypath(((String) jsonContext.get("policypath")));
			context.setGate(((String) jsonContext.get("gate")));
			context.setImageids(((String) jsonContext.get("imageids")));

			Object payload = jsonContext.get("payload");
			if (payload != null) {
				if (payload instanceof String) {
					context.setPayload((String) payload);
				} else {
					context.setPayload(objectMapper.writeValueAsString(objectMapper.convertValue((Map<String, Object>) jsonContext.get("payload"), ObjectNode.class)));
				}
			}

			String url = String.format("%s/%s", context.getPolicyurl().endsWith("/") ? context.getPolicyurl().substring(0, context.getPolicyurl().length() - 1) : context.getPolicyurl(), context.getPolicypath().startsWith("/") ? context.getPolicypath().substring(1) : context.getPolicypath());

			HttpPost request = new HttpPost(url);
			String triggerPayload = getPayloadString(context, stage.getExecution().getApplication(), stage.getExecution().getName(),
					stage.getExecution().getId(), stage.getExecution().getAuthentication().getUser(), context.getPayload(), stage.getContext().get(PAYLOAD_CONSTRAINT));
			outputs.put(TRIGGER_JSON, String.format("Payload json - %s", triggerPayload));
			request.setEntity(new StringEntity(triggerPayload));
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", stage.getExecution().getAuthentication().getUser());

			httpClient = HttpClients.createDefault();
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
				getMessage(registerResponse, ALLOW).forEach(a -> {
					if (StringUtils.isNotBlank(message)) {
						message.append(",\n");
					}
					message.append(a);
				});

				outputs.put(STATUS, ALLOW);
				outputs.put(MESSAGE, message.toString());
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return TaskResult.builder(ExecutionStatus.SUCCEEDED)
						.context(contextMap)
						.outputs(outputs)
						.build();

			} else  if (response.getStatusLine().getStatusCode() == 401 ) {
				StringBuilder message = new StringBuilder();
				getMessage(registerResponse, DENY).forEach(a -> {
					if (StringUtils.isNotBlank(message)) {
						message.append(",\n");
					}
					message.append(a);
				});

				outputs.put(STATUS, DENY);
				outputs.put(MESSAGE, message.toString());
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();

			} else {
				outputs.put(STATUS, DENY);
				outputs.put("REASON", String.format("Policy verification status code :: %s, %s", response.getStatusLine().getStatusCode(), registerResponse));
				outputs.put(MESSAGE, String.format("Policy verification failed :: %s", registerResponse));
				outputs.put(EXECUTED_BY, stage.getExecution().getAuthentication().getUser());
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}			

		} catch (Exception e) {
			logger.error("Error occurred while triggering policy ", e);
			outputs.put(STATUS, DENY);
			outputs.put(MESSAGE, String.format("Policy trigger failed with exception :: %s", e.getMessage()));
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


	private List<String> getMessage(String registerResponse, String key) throws JsonProcessingException, JsonMappingException {
		List<String> deny = Lists.newArrayList();
		JsonNode rootNode = objectMapper.readTree(registerResponse);  
		iterateJsonObject(key, deny, rootNode);
		return deny;
	}


	private void iterateJsonObject(String key, List<String> deny, JsonNode rootNode) {
		Iterator<Map.Entry<String,JsonNode>> fieldsIterator = rootNode.fields();
		while (fieldsIterator.hasNext()) {
			Map.Entry<String,JsonNode> field = fieldsIterator.next();
			if (field.getKey().equalsIgnoreCase(key)) {
				Iterator<JsonNode> iterator = field.getValue().iterator();
				if (iterator.hasNext()) {
					deny.add(iterator.next().asText());
				}
			} else {
				if (field.getValue() instanceof ObjectNode ) {
					iterateJsonObject(key, deny, field.getValue());
				} else if (field.getValue() instanceof ArrayNode ) {
					((ArrayNode) field.getValue()).forEach(obj -> {
						iterateJsonObject(key, deny, obj);
					});
				}
			}
		}
	}

	private String getPayloadString(PolicyContext context, String application, String name, String executionId, String user, String payload, Object gateSecurity) throws JsonProcessingException {
		ObjectNode finalJson = objectMapper.createObjectNode();

		if (payload != null && ! payload.trim().isEmpty()) {
			finalJson = (ObjectNode) objectMapper.readTree(payload);
			finalJson.put("executionId", executionId);
			finalJson.put(START_TIME, System.currentTimeMillis());
			finalJson.put(APPLICATION2, application);
			finalJson.put(NAME2, name);
			finalJson.set(TRIGGER, objectMapper.createObjectNode().put(USER2, user));
			if (context.getImageids() != null && !context.getImageids().isEmpty()) {
				ArrayNode images = objectMapper.createArrayNode();
				Arrays.asList(context.getImageids().split(",")).forEach(a -> {
					images.add(a.trim());
				});
				finalJson.set("imageIds", images);
			}
		} else {
			finalJson.put(START_TIME, System.currentTimeMillis());
			finalJson.put(APPLICATION2, application);
			finalJson.put(NAME2, name);
			finalJson.put("stage", context.getGate());
			finalJson.put("executionId", executionId);
			finalJson.set(TRIGGER, objectMapper.createObjectNode().put(USER2, user));
			if (context.getImageids() != null && !context.getImageids().isEmpty()) {
				ArrayNode images = objectMapper.createArrayNode();
				Arrays.asList(context.getImageids().split(",")).forEach(a -> {
					images.add(a.trim());
				});
				finalJson.set("imageIds", images);
			}
		}

		if (gateSecurity != null) {
			String gateSecurityPayload = objectMapper.writeValueAsString(gateSecurity);
			finalJson.set(PAYLOAD_CONSTRAINT, objectMapper.readTree(gateSecurityPayload));
		}

		return objectMapper.writeValueAsString(finalJson);
	}
}
