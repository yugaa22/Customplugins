package com.opsmx.plugin.stage.custom;

import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

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
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.spinnaker.kork.plugins.api.PluginComponent;
import com.netflix.spinnaker.orca.api.pipeline.Task;
import com.netflix.spinnaker.orca.api.pipeline.TaskResult;
import com.netflix.spinnaker.orca.api.pipeline.models.ExecutionStatus;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;
import org.springframework.beans.factory.annotation.Value;

@Extension
@PluginComponent
public class ApprovalTriggerTask implements Task {

	@Value("${isd.gate.url:http://oes-gate:8084}")
	private String isdGateUrl;

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

	public static final String NAVIGATIONAL_URL = "navigationalURL";

	public static final String APPROVAL_URL = "approvalUrl";

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private final ObjectMapper objectMapper = new ObjectMapper();

	@NotNull
	@Override
	public TaskResult execute(@NotNull StageExecution stage) {

		Map<String, Object> contextMap = new HashMap<>();
		Map<String, Object> outputs = new HashMap<>();

		logger.info("Approval execution started, Application name : {}, Pipeline name : {}", stage.getExecution().getApplication(), stage.getExecution().getName());
		CloseableHttpClient httpClient = null;
		try {
			String triggerUrl = getTriggerURL(stage, outputs);
			if (triggerUrl == null) {
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.context(contextMap)
						.outputs(outputs)
						.build();
			}

			logger.info("Application name : {}, pipeline name : {}", stage.getExecution().getApplication(), stage.getExecution().getName());
			HttpPost request = new HttpPost(triggerUrl);
			String triggerPayload = preparePayload((Map<String, Object>) stage.getContext().get("parameters"), stage.getExecution().getId());
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
			outputs.put(LOCATION, response.getLastHeader(LOCATION).getValue());
			outputs.put(TRIGGER, SUCCESS);
			if (readValue.get(NAVIGATIONAL_URL) != null  &&  !readValue.get(NAVIGATIONAL_URL).isNull()) {
				outputs.put(NAVIGATIONAL_URL, String.format("%s/fromPlugin?instanceId=%s",readValue.get(NAVIGATIONAL_URL).asText(), readValue.get("id").asText()));
				outputs.put(APPROVAL_URL, String.format("%s/fromPlugin?instanceId=%s",readValue.get(NAVIGATIONAL_URL).asText(), readValue.get("id").asText()));
			}

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
					logger.info("Error while closing client connection");
				}
			}
		}
	}

	private String preparePayload(Map<String, Object> parameterContext, String executionId) throws JsonProcessingException {

		ObjectNode finalJson = objectMapper.createObjectNode();

		finalJson.put("approvalCallbackURL", "http://oes-platform:8095/callbackurl");
		finalJson.put("rejectionCallbackURL", "http://oes-platform:8095/rejectionbackurl");
		finalJson.put("executionId", executionId);
		String connectorJson = objectMapper.writeValueAsString(parameterContext.get(CONNECTORS));
		ArrayNode connectorNode = (ArrayNode) objectMapper.readTree(connectorJson);
		ArrayNode toolConnectorPayloads = objectMapper.createArrayNode();
		connectorNode.forEach(connector ->
				setParameters(toolConnectorPayloads, connector)
		);
		finalJson.set(TOOL_CONNECTOR_PARAMETERS, toolConnectorPayloads);
		finalJson.set("customConnectorData", objectMapper.createArrayNode());
		ArrayNode payloadConstraintNode = objectMapper.createArrayNode();
		if (parameterContext.get("gateSecurity") != null) {
			String gateSecurityPayload = objectMapper.writeValueAsString(parameterContext.get("gateSecurity"));
			ArrayNode securityNode = (ArrayNode) objectMapper.readTree(gateSecurityPayload);
			securityNode.forEach(secNode -> {
				ArrayNode valuesNode = (ArrayNode)secNode.get("values");
				for (JsonNode jsonNode : valuesNode) {
					if (jsonNode.get("label") != null && !jsonNode.get("label").isNull() && !jsonNode.get("label").asText().isBlank()) {
						payloadConstraintNode.add(objectMapper.createObjectNode()
								.put(jsonNode.get("label").asText(), jsonNode.get("value").isNull() ? null : jsonNode.get("value").asText()));
					}
				}
			});
		}
		finalJson.set(PAYLOAD_CONSTRAINT, payloadConstraintNode);
		logger.debug("Payload string to trigger approval : {}", finalJson);

		return objectMapper.writeValueAsString(finalJson);
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
		switch (connectorType) {
			case JIRA:
				singlePayload(toolConnectorPayloads, connector, JIRA, JIRA_TICKET_NO);
				break;
			case AUTOPILOT:
				singlePayload(toolConnectorPayloads, connector, AUTOPILOT, CANARY_ID);
				break;
			case AQUAWAVE:
				singlePayload(toolConnectorPayloads, connector, AQUAWAVE, IMAGE_ID);
				break;
			case APPSCAN:
				singlePayload(toolConnectorPayloads, connector, APPSCAN, REPORT_ID);
				break;
			case SONARQUBE:
				singlePayload(toolConnectorPayloads, connector, SONARQUBE, PROJECT_KEY);
				break;
			case JFROG:
				singlePayload(toolConnectorPayloads, connector, JFROG, WATCH_NAME);
				break;
			case GIT:
				gitPayload(toolConnectorPayloads, connector);
				break;
			case JENKINS:
				jenkinsPayload(toolConnectorPayloads, connector);
				break;
			case BAMBOO:
				bambooPayload(toolConnectorPayloads, connector);
				break;
			case PRISMACLOUD:
				singlePayload(toolConnectorPayloads, connector, PRISMACLOUD, IMAGE_ID);
				break;
			case BITBUCKET:
				bitBucket(toolConnectorPayloads, connector);
				break;
			case SERVICENOW:
				singlePayload(toolConnectorPayloads, connector, SERVICENOW, NUMBER);
				break;
			case ARTIFACTORY:
				artifactoryBucket(toolConnectorPayloads, connector);
				break;
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
				outputs.put(EXCEPTION, String.format("Failed to get the trigger endpoint with Response :: %s", registerResponse));
				outputs.put(TRIGGER, FAILED);
				outputs.put(STATUS, REJECTED);
				return null;
			}

			ObjectNode readValue = objectMapper.readValue(registerResponse, ObjectNode.class);
			String triggerUrl = readValue.get("gateUrl").isNull() ? null : readValue.get("gateUrl").asText();
			if (triggerUrl == null || triggerUrl.isBlank() || triggerUrl.equalsIgnoreCase("null")) {
				outputs.put(EXCEPTION, String.format("Failed to get the trigger endpoint with Response :: %s", registerResponse));
				outputs.put(TRIGGER, FAILED);
				outputs.put(STATUS, REJECTED);
				return null;
			}
			return triggerUrl;
		} catch (Exception e) {
			logger.error("Failed to execute approval gate", e);
			outputs.put(EXCEPTION, String.format("Error occurred while getting trigger endpoint, %s", e));
			outputs.put(TRIGGER, FAILED);
			outputs.put(STATUS, REJECTED);
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
		return String.format("%s/platformservice/v6/applications/%s/pipeline/%s/reference/%s/gates/%s?type=approval",
				isdGateUrl.endsWith("/") ? isdGateUrl.substring(0, isdGateUrl.length() - 1) : isdGateUrl,
				stage.getExecution().getApplication(), stage.getExecution().getName(), stage.getRefId(),
				stage.getName());
	}
}
