package com.opsmx.plugin.stage.custom;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.spinnaker.kork.plugins.api.PluginComponent;
import com.netflix.spinnaker.orca.api.pipeline.RetryableTask;
import com.netflix.spinnaker.orca.api.pipeline.TaskResult;
import com.netflix.spinnaker.orca.api.pipeline.models.ExecutionStatus;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;

@Extension
@PluginComponent
public class ApprovalMonitorTask implements RetryableTask {

	private static final String COMMENT2 = "comment";

	private static final String REJECTED = "rejected";

	private static final String APPROVED = "approved";

	public static final String LOCATION = "location";

	private static final String EXCEPTION = "exception";

	public static final String STATUS = "status";

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ObjectMapper objectMapper = new ObjectMapper();

	@NotNull
	@Override
	public TaskResult execute(@NotNull StageExecution stage) {

		Map<String, Object> outputs = stage.getOutputs();
		String trigger = (String) outputs.getOrDefault(ApprovalTriggerTask.TRIGGER, "NOTYET");

		Map<String, Object> contextMap = new HashMap<>();
		
		if (trigger.equals(ApprovalTriggerTask.FAILED)) {
			logger.info("Approval Monitoring terminating because trigger task failed, Application : {}, Pipeline : {}", 
					stage.getExecution().getApplication(), stage.getExecution().getName());
			return TaskResult.builder(ExecutionStatus.TERMINAL)
					.context(contextMap)
					.outputs(outputs)
					.build();
		} else if (trigger.equals(ApprovalTriggerTask.SUCCESS)) {
			logger.info("Approval Monitoring started, Application : {}, Pipeline : {}",
					stage.getExecution().getApplication(), stage.getExecution().getName());
			String approvalUrl = (String) outputs.get(LOCATION);
			return getVerificationStatus(approvalUrl, stage.getExecution().getAuthentication().getUser(), outputs);
		} else {
			logger.info("Approval Monitoring not starting because trigger task not completed");
		  return TaskResult.builder(ExecutionStatus.RUNNING)
			.context(contextMap)
			.outputs(outputs)
			.build();
		}
	}


	private TaskResult cancelRequest(String approvalUrl, String user, Map<String, Object> outputs, String reason) {
		HttpPost request = new HttpPost(approvalUrl);

		ObjectNode finalJson = objectMapper.createObjectNode();
		finalJson.put("action", "cancel");
		finalJson.put("comment", reason);

		CloseableHttpClient httpClient = HttpClients.createDefault();
		try {
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", user);
			String payload = finalJson.toString();
			request.setEntity(new StringEntity(payload));
			CloseableHttpResponse response = httpClient.execute(request);
		} catch (IOException e) {
			logger.info("Exception occurred while cancelling approval", e);
		} finally {
			if (httpClient != null) {
				try {
					httpClient.close();
				} catch (IOException e) {
					logger.warn("Exception occurred while closing the connection", e);
				}
			}
		}

		return TaskResult.builder(ExecutionStatus.CANCELED)
				.outputs(outputs)
				.build();
	}

	private TaskResult getVerificationStatus(String approvalUrl, String user, Map<String, Object> outputs) {
		HttpGet request = new HttpGet(approvalUrl);

		CloseableHttpClient httpClient = null;
		try {
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", user);
			httpClient = HttpClients.createDefault();
			CloseableHttpResponse response = httpClient.execute(request);

			HttpEntity entity = response.getEntity();
			ObjectNode readValue = objectMapper.readValue(EntityUtils.toString(entity), ObjectNode.class);
			String analysisStatus = readValue.get(STATUS).asText();
			String comment = "";
			if (readValue.get(COMMENT2) != null && !readValue.get(COMMENT2).asText().isEmpty()) {
				comment = readValue.get(COMMENT2).asText();
			}

			logger.info("Approval status : {}", analysisStatus);
			if (analysisStatus.equalsIgnoreCase(APPROVED)) {
				outputs.put(STATUS, analysisStatus);
				outputs.put("comments", comment);
				return TaskResult.builder(ExecutionStatus.SUCCEEDED)
						.outputs(outputs)
						.build();
			} else if (analysisStatus.equalsIgnoreCase(REJECTED)) {
				outputs.put(STATUS, analysisStatus);
				outputs.put("comments", comment);
				return TaskResult.builder(ExecutionStatus.TERMINAL)
						.outputs(outputs)
						.build();
			} 
			return TaskResult.builder(ExecutionStatus.RUNNING)
					.outputs(outputs)
					.build();

		} catch (Exception e) {
			logger.error("Error occurred while processing approval result ", e);
			outputs.put(EXCEPTION, String.format("Error occurred while processing, %s", e));
			return TaskResult.builder(ExecutionStatus.TERMINAL)
					.outputs(outputs)
					.build();
		} finally {
			if (httpClient != null) {
				try {
					httpClient.close();
				} catch (IOException e) {
					logger.warn("Exception occured while closing the connection", e);
				}
			}
		}
	}

	@Override
	public long getBackoffPeriod() {
		return TimeUnit.SECONDS.toMillis(30);
	}

	@Override
	public long getTimeout() {
		return TimeUnit.DAYS.toMillis(1);
	}
}
