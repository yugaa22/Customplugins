package com.opsmx.plugin.stage.custom;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
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
import com.fasterxml.jackson.databind.JsonNode;
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
public class ApprovalTriggerTask implements Task {

	private static final String PAYLOAD_CONSTRAINT = "payloadConstraint";

	private static final String REPOSITORY_PATH = "repositoryPath";

	private static final String ARTIFACTORY = "ARTIFACTORY";

	private static final String TYPE = "type";

	private static final String NUMBER = "number";

	private static final String SERVICENOW = "SERVICENOW";

	private static final String REPOSITORY_NAME = "repositoryName";

	private static final String BITBUCKET = "BITBUCKET";

	private static final String IMAGE_ID = "imageId";

	private static final String PRISMACLOUD = "PRISMACLOUD";

	public static final String FAILED = "FAILED";

	public static final String SUCCESS = "SUCCESS";

	public static final String TRIGGER = "trigger";

	private static final String TRIGGER_JSON = "trigger_json";

	private static final String CONNECTORS = "connectors";

	private static final String GATE_URL = "gateUrl";

	private static final String VALUES = "values";

	private static final String BUILD_NUMBER = "buildNumber";

	private static final String PLAN_NAME = "planName";

	private static final String PROJECT_NAME = "projectName";

	private static final String WATCH_NAME = "watch_name";

	private static final String JFROG = "JFROG";

	private static final String BAMBOO = "BAMBOO";

	private static final String REPORT_ID = "reportId";

	private static final String REJECTED = "rejected";

	private static final String LOCATION = "location";

	private static final String TOOL_CONNECTOR_PARAMETERS = "toolConnectorParameters";

	private static final String CANARY_ID = "canaryId";

	private static final String AUTOPILOT = "AUTOPILOT";

	private static final String AQUAWAVE = "AQUAWAVE";

	private static final String APPSCAN = "APPSCAN";

	private static final String PROJECT_KEY = "projectKey";

	private static final String SONARQUBE = "SONARQUBE";

	private static final String ARTIFACT = "artifact";

	private static final String BUILD_ID = "buildId";

	private static final String JOB = "job";

	private static final String JENKINS = "JENKINS";

	private static final String REPO = "repo";

	private static final String COMMIT_ID = "commitId";

	private static final String GIT = "GIT";

	private static final String JIRA_TICKET_NO = "jira_ticket_no";

	private static final String PARAMETERS = "parameters";

	private static final String CONNECTOR_TYPE = "connectorType";

	private static final String JIRA = "JIRA";

	private static final String EXCEPTION = "exception";

	public static final String STATUS = "status";

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ObjectMapper objectMapper = new ObjectMapper();

	@NotNull
	@Override
	public TaskResult execute(@NotNull StageExecution stage) {

		Map<String, Object> contextMap = new HashMap<>();
		Map<String, Object> outputs = new HashMap<>();

		logger.info("Approval execution started, Application name : {}, Pipeline name : {}", stage.getExecution().getApplication(), stage.getExecution().getName());
		CloseableHttpClient httpClient = null;
		try {

			Map<String, Object> jsonContext = (Map<String, Object>) stage.getContext().get("parameters");

			if (jsonContext.get(GATE_URL) == null || ((String) jsonContext.get(GATE_URL)).isEmpty()) {
				logger.info("Gate Url should not be empty");
				outputs.put(EXCEPTION, "Gate Url should not be empty");
				outputs.put(TRIGGER, FAILED);
				outputs.put(STATUS, REJECTED);
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}

			Object gateSecurity = stage.getContext().get(PAYLOAD_CONSTRAINT);

			String gateUrl = (String) jsonContext.get(GATE_URL);
			logger.info("Application name : {}, pipeline name : {}, GateUrl : {}", stage.getExecution().getApplication(), stage.getExecution().getName(), gateUrl);

			HttpPost request = new HttpPost(gateUrl);
			String triggerPayload = preparePayload(jsonContext, stage.getExecution().getId(), gateSecurity);
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
			logger.info("Approval trigger response : {}", registerResponse);
			if (response.getStatusLine().getStatusCode() != 202) {
				logger.info("Failed to trigger approval request with Status code : {}, Response : {}", response.getStatusLine().getStatusCode(), registerResponse);
				outputs.put(EXCEPTION, String.format("Failed to trigger approval request with Status code : %s and Response : %s", response.getStatusLine().getStatusCode(), registerResponse));
				outputs.put(TRIGGER, FAILED);
				outputs.put(STATUS, REJECTED);
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}

			ObjectNode readValue = objectMapper.readValue(registerResponse, ObjectNode.class);
			if (readValue.get("navigationalURL") != null  &&  !readValue.get("navigationalURL").isNull()) {
				logger.info("################# :{}", readValue.get("navigationalURL").asText());
				outputs.put("navigationalURL", readValue.get("navigationalURL").asText());
			}

			outputs.put(LOCATION, response.getLastHeader(LOCATION).getValue());
			outputs.put(TRIGGER, SUCCESS);

			return TaskResult.builder(ExecutionStatus.SUCCEEDED)
					.context(contextMap)
					.outputs(outputs)
					.build();

		} catch (Exception e) {
			logger.error("Error occurred while processing approval", e);
			outputs.put(EXCEPTION, String.format("Error occurred while processing, %s", e));
			outputs.put(TRIGGER, FAILED);
			outputs.put(STATUS, REJECTED);
			return TaskResult.builder(ExecutionStatus.TERMINAL)
					.context(contextMap)
					.outputs(outputs)
					.build();
		}  finally {
			if (httpClient != null) {
				try {
					httpClient.close();
				} catch (IOException e) {
				}
			}
		}
	}

	private String preparePayload(Map<String, Object> parameterContext, String executionId, Object gateSecurity) throws JsonProcessingException {

		ObjectNode finalJson = objectMapper.createObjectNode();

		finalJson.put("approvalCallbackURL", "http://oes-platform:8095/callbackurl");
		finalJson.put("rejectionCallbackURL", "http://oes-platform:8095/rejectionbackurl");
		finalJson.put("executionId", executionId);
		ArrayNode imageIdsNode = objectMapper.createArrayNode();
		String imageIds = (String) parameterContext.get("imageIds");
		if (imageIds != null && ! imageIds.isEmpty()) {
			Arrays.asList(imageIds.split(",")).forEach(tic -> 
			imageIdsNode.add(tic.trim())
					);
		}
		ArrayNode gateSecurityNode = objectMapper.createArrayNode();
		if (gateSecurity != null) {
			String gateSecurityPayload = objectMapper.writeValueAsString(gateSecurity);
			gateSecurityNode = (ArrayNode) objectMapper.readTree(gateSecurityPayload);
			finalJson.set(PAYLOAD_CONSTRAINT, gateSecurityNode);
		}
		finalJson.set("imageIds", imageIdsNode);
		String connectorJson = objectMapper.writeValueAsString(parameterContext.get(CONNECTORS));
		ArrayNode connectorNode = (ArrayNode) objectMapper.readTree(connectorJson);
		ArrayNode toolConnectorPayloads = objectMapper.createArrayNode();
		connectorNode.forEach(connector -> 
		setParameters(toolConnectorPayloads, connector)
				);

		finalJson.set(TOOL_CONNECTOR_PARAMETERS, toolConnectorPayloads);
		finalJson.set("customConnectorData", objectMapper.createArrayNode());
		logger.info("Payload string to trigger approval : {}", finalJson);

		return finalJson.toString();
	}

	private void setParameters(ArrayNode toolConnectorPayloads, JsonNode connector) {

		ArrayNode supporetedParams = (ArrayNode) connector.get("supportedParams");
		boolean hasType =  supporetedParams.get(0).has(TYPE);

		if(hasType) {
			dynamicPayload(toolConnectorPayloads, connector, supporetedParams);
		} else {
			nonDynamic(toolConnectorPayloads, connector);
		}
	}

	private void nonDynamic(ArrayNode toolConnectorPayloads, JsonNode connector) {
		String connectorType = connector.get(CONNECTOR_TYPE).asText();
		if (connectorType.equals(JIRA)) {
			singlePayload(toolConnectorPayloads, connector, JIRA, JIRA_TICKET_NO);
		} else if (connectorType.equals(AUTOPILOT)) {
			singlePayload(toolConnectorPayloads, connector, AUTOPILOT, CANARY_ID);
		} else if (connectorType.equals(AQUAWAVE)) {
			singlePayload(toolConnectorPayloads, connector, AQUAWAVE, IMAGE_ID);
		} else if (connectorType.equals(APPSCAN)) {
			singlePayload(toolConnectorPayloads, connector, APPSCAN, REPORT_ID);
		} else if (connectorType.equals(SONARQUBE)) {
			singlePayload(toolConnectorPayloads, connector, SONARQUBE, PROJECT_KEY);
		} else if (connectorType.equals(JFROG)) {
			singlePayload(toolConnectorPayloads, connector, JFROG, WATCH_NAME);
		} else if (connectorType.equals(GIT)) {
			gitPayload(toolConnectorPayloads, connector);
		} else if (connectorType.equals(JENKINS)) {
			jenkinsPayload(toolConnectorPayloads, connector);
		} else if (connectorType.equals(BAMBOO)) {
			bambooPayload(toolConnectorPayloads, connector);
		}  else if (connectorType.equals(PRISMACLOUD)) {
			singlePayload(toolConnectorPayloads, connector, PRISMACLOUD, IMAGE_ID);
		} else if (connectorType.equals(BITBUCKET)) {
			bitBucket(toolConnectorPayloads, connector);
		} else if (connectorType.equals(SERVICENOW)) {
			singlePayload(toolConnectorPayloads, connector, SERVICENOW, NUMBER);
		} else if (connectorType.equals(ARTIFACTORY)) {
			artifactoryBucket(toolConnectorPayloads, connector);
		}
	}

	private void dynamicPayload(ArrayNode toolConnectorPayloads, JsonNode connector, ArrayNode supporetedParams) {
		ArrayNode valuesNode = (ArrayNode) connector.get(VALUES);
		ArrayNode parameterArrayNode = objectMapper.createArrayNode();
		valuesNode.forEach(a -> {
			if (a != null) {
				Iterator<String> fieldNames = a.fieldNames();
				ObjectNode payloadObject = objectMapper.createObjectNode();
				while (fieldNames.hasNext()) {
					String key = fieldNames.next();
					if (a.get(key) != null && ! a.get(key).asText().isEmpty()) {
						supporetedParams.forEach(sp -> {
							String name = sp.get("name").asText();
							if (name.equals(key)) {
								String type = sp.get(TYPE).asText();
								if(type.equalsIgnoreCase("string")) {
									payloadObject.put(key, a.get(key).asText().trim());
								} else {
									ArrayNode paramsNode = objectMapper.createArrayNode();
									Arrays.asList(a.get(key).asText().split(",")).forEach(tic -> 
									paramsNode.add(tic.trim())
											);
									payloadObject.set(key, paramsNode);
								}
							}
						});
					}
				}

				if(payloadObject.size() > 0) {
					parameterArrayNode.add(payloadObject);
				}
			}
		});

		if (parameterArrayNode != null && parameterArrayNode.size() >= 1) {
			toolConnectorPayloads.add(objectMapper.createObjectNode().put(CONNECTOR_TYPE, connector.get(CONNECTOR_TYPE).asText()).set(PARAMETERS, parameterArrayNode));
		}
	}

	private void artifactoryBucket(ArrayNode toolConnectorPayloads, JsonNode connector) {
		ObjectNode artifactoryNode = objectMapper.createObjectNode();
		artifactoryNode.put(CONNECTOR_TYPE, ARTIFACTORY);
		ArrayNode parameterArrayNode = objectMapper.createArrayNode();
		ArrayNode valuesNode = (ArrayNode) connector.get(VALUES);
		valuesNode.forEach(gitNode -> {
			if (gitNode != null && gitNode.get(REPOSITORY_PATH) != null && ! gitNode.get(REPOSITORY_PATH).asText().isEmpty()) {				

				parameterArrayNode.add(objectMapper.createObjectNode().put(REPOSITORY_PATH, gitNode.get(REPOSITORY_PATH).asText().trim()));
			}
		});

		if (parameterArrayNode != null && parameterArrayNode.size() >= 1) {
			artifactoryNode.set(PARAMETERS, parameterArrayNode);
			toolConnectorPayloads.add(artifactoryNode);
		}
	}

	private void bitBucket(ArrayNode toolConnectorPayloads, JsonNode connector) {
		ObjectNode gitObjectNode = objectMapper.createObjectNode();
		gitObjectNode.put(CONNECTOR_TYPE, BITBUCKET);
		ArrayNode parameterArrayNode = objectMapper.createArrayNode();
		ArrayNode valuesNode = (ArrayNode) connector.get(VALUES);
		valuesNode.forEach(gitNode -> {
			if (gitNode != null && gitNode.get(REPOSITORY_NAME) != null && ! gitNode.get(REPOSITORY_NAME).asText().isEmpty() 
					&& gitNode.get(COMMIT_ID) != null && ! gitNode.get(COMMIT_ID).asText().isEmpty()) {				

				parameterArrayNode.add(objectMapper.createObjectNode().put(REPOSITORY_NAME, gitNode.get(REPOSITORY_NAME).asText()).put(COMMIT_ID, gitNode.get(COMMIT_ID).asText()));
			}
		});

		if (parameterArrayNode != null && parameterArrayNode.size() >= 1) {
			gitObjectNode.set(PARAMETERS, parameterArrayNode);
			toolConnectorPayloads.add(gitObjectNode);
		}
	}

	private void bambooPayload(ArrayNode toolConnectorPayloads, JsonNode connector) {
		ObjectNode bambooObjectNode = objectMapper.createObjectNode();
		bambooObjectNode.put(CONNECTOR_TYPE, BAMBOO);
		ArrayNode parameterArrayNode = objectMapper.createArrayNode();
		ArrayNode valuesNode = (ArrayNode) connector.get(VALUES);
		valuesNode.forEach(bambooNode -> {
			if (bambooNode != null && bambooNode.get(PROJECT_NAME) != null && ! (bambooNode.get(PROJECT_NAME).asText()).isEmpty() 
					&& bambooNode.get(PLAN_NAME) != null && ! bambooNode.get(PLAN_NAME).asText().isEmpty()
					&& bambooNode.get(BUILD_NUMBER) != null && ! bambooNode.get(BUILD_NUMBER).asText().isEmpty()) {
				parameterArrayNode.add(objectMapper.createObjectNode()
						.put(PROJECT_NAME, bambooNode.get(PROJECT_NAME).asText().trim())
						.put(PLAN_NAME, bambooNode.get(PLAN_NAME).asText().trim())
						.put(BUILD_NUMBER, bambooNode.get(BUILD_NUMBER) != null ?  bambooNode.get(BUILD_NUMBER).asText().trim() : ""));
			}
		});

		if (parameterArrayNode != null && parameterArrayNode.size() >= 1) {
			bambooObjectNode.set(PARAMETERS, parameterArrayNode);
			toolConnectorPayloads.add(bambooObjectNode);
		}
	}

	private void jenkinsPayload(ArrayNode toolConnectorPayloads, JsonNode connector) {
		ObjectNode jenkinsObjectNode = objectMapper.createObjectNode();
		jenkinsObjectNode.put(CONNECTOR_TYPE, JENKINS);
		ArrayNode parameterArrayNode = objectMapper.createArrayNode();
		ArrayNode valuesNode = (ArrayNode) connector.get(VALUES);
		valuesNode.forEach(jenkinsNode -> {
			if (jenkinsNode != null && jenkinsNode.get(JOB) != null && ! (jenkinsNode.get(JOB).asText()).isEmpty() 
					&& jenkinsNode.get(BUILD_ID) != null && ! (jenkinsNode.get(BUILD_ID).asText()).isEmpty()) {
				parameterArrayNode.add(objectMapper.createObjectNode()
						.put(JOB, jenkinsNode.get(JOB).asText().trim())
						.put(BUILD_ID, jenkinsNode.get(BUILD_ID).asText().trim())
						.put(ARTIFACT, jenkinsNode.get(ARTIFACT) != null ?  jenkinsNode.get(ARTIFACT).asText().trim() : ""));
			}
		});

		if (parameterArrayNode != null && parameterArrayNode.size() >= 1) {
			jenkinsObjectNode.set(PARAMETERS, parameterArrayNode);
			toolConnectorPayloads.add(jenkinsObjectNode);
		}
	}

	private void gitPayload(ArrayNode toolConnectorPayloads, JsonNode connector) {
		ObjectNode gitObjectNode = objectMapper.createObjectNode();
		gitObjectNode.put(CONNECTOR_TYPE, GIT);
		ArrayNode parameterArrayNode = objectMapper.createArrayNode();
		ArrayNode valuesNode = (ArrayNode) connector.get(VALUES);
		valuesNode.forEach(gitNode -> {
			if (gitNode != null && gitNode.get(REPO) != null && ! gitNode.get(REPO).asText().isEmpty() 
					&& gitNode.get(COMMIT_ID) != null && ! gitNode.get(COMMIT_ID).asText().isEmpty()) {
				ArrayNode commitIds = objectMapper.createArrayNode();
				Arrays.asList(gitNode.get(COMMIT_ID).asText().split(",")).forEach(a -> 
				commitIds.add(a.trim())
						);

				parameterArrayNode.add(objectMapper.createObjectNode().put(REPO, gitNode.get(REPO).asText()).set(COMMIT_ID, commitIds));
			}
		});

		if (parameterArrayNode != null && parameterArrayNode.size() >= 1) {
			gitObjectNode.set(PARAMETERS, parameterArrayNode);
			toolConnectorPayloads.add(gitObjectNode);
		}
	}

	private void singlePayload(ArrayNode toolConnectorPayloads, JsonNode connector, String type, String param) {
		ObjectNode singleObjectNode = objectMapper.createObjectNode();
		singleObjectNode.put(CONNECTOR_TYPE, type);
		ArrayNode paramsNode = objectMapper.createArrayNode();
		ArrayNode valuesNode = (ArrayNode) connector.get(VALUES);
		valuesNode.forEach(a -> {
			if (a != null) {
				Arrays.asList(a.get(param).asText().split(",")).forEach(tic -> 
				paramsNode.add(tic.trim())
						);
			}
		});
		singleObjectNode.set(PARAMETERS, objectMapper.createArrayNode().add(objectMapper.createObjectNode().set(param, paramsNode)));
		toolConnectorPayloads.add(singleObjectNode);
	}
}
