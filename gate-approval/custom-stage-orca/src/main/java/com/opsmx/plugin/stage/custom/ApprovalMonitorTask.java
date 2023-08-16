package com.opsmx.plugin.stage.custom;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.spinnaker.kork.plugins.api.PluginComponent;
import com.netflix.spinnaker.orca.api.pipeline.RetryableTask;
import com.netflix.spinnaker.orca.api.pipeline.TaskResult;
import com.netflix.spinnaker.orca.api.pipeline.models.ExecutionStatus;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPut;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.jetbrains.annotations.NotNull;
import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

@Extension
@PluginComponent
public class ApprovalMonitorTask implements RetryableTask {

	private static final String COMMENT2 = "comment";

	private static final String REJECTED = "rejected";

	private static final String APPROVED = "approved";

	private static final String CANCELED = "canceled";

	public static final String LOCATION = "location";

	private static final String EXCEPTION = "exception";

	public static final String STATUS = "status";

	@Value("${isd.retry.intervalInMinutes:1}")
	private Integer retryInterval;

	@Value("${isd.retry.count:3}")
	private Integer retryCount;

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
			return getApprovalStatus(approvalUrl, stage.getExecution().getAuthentication().getUser(), outputs, 0);
		} else {
			logger.info("Approval Monitoring not starting because trigger task not completed");
			return TaskResult.builder(ExecutionStatus.RUNNING)
					.context(contextMap)
					.outputs(outputs)
					.build();
		}
	}


	private TaskResult cancelRequest(String approvalUrl, String user, Map<String, Object> outputs, String reason) {
		logger.info("ApprovalUrl : {}",approvalUrl);
		logger.info("Execution  authentication user: {}",user);
		HttpPut request = new HttpPut(approvalUrl);

		ObjectNode finalJson = objectMapper.createObjectNode();
		finalJson.put("action", "cancel");
		finalJson.put("comment", reason);

		CloseableHttpClient httpClient = HttpClients.createDefault();
		try {
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", user);
			logger.info("*********** x-spinnaker-user :{}",user);
			String payload = finalJson.toString();
			request.setEntity(new StringEntity(payload));
			CloseableHttpResponse response = httpClient.execute(request);
			logger.info("Approval CANCEL STATUS on Timeout : {}", response.getStatusLine().getStatusCode());
			if (response.getStatusLine().getStatusCode() != 200) {
				return cancelRequest(approvalUrl,user,outputs,reason);
			}
		} catch (Exception e) {
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

	private TaskResult getApprovalStatus(String approvalUrl, String user, Map<String, Object> outputs, Integer count) {

		if (count < retryCount) {
			count += 1;
			HttpGet request = new HttpGet(approvalUrl);
			CloseableHttpClient httpClient = null;
			try {
				request.setHeader("Content-type", "application/json");
				request.setHeader("x-spinnaker-user", user);
				httpClient = HttpClients.createDefault();
				CloseableHttpResponse response = httpClient.execute(request);
				String res = EntityUtils.toString(response.getEntity());
				if (response.getStatusLine().getStatusCode() != 200) {
					if (count == retryCount) {
						logger.error("Error occurred while getting approval response, with Status code : {}, response {}",
								response.getStatusLine().getStatusCode(), res);
						outputs.put("Reason", String.format("Maximum retry count exceeded :: %s ", res));
						outputs.put(EXCEPTION,
								String.format("Failed to get the status of request with response : %s", res));
						return TaskResult.builder(ExecutionStatus.TERMINAL)
								.outputs(outputs)
								.build();
					} else {
						Thread.sleep(retryInterval * 60 * 1000);
						return getApprovalStatus(approvalUrl, user, outputs, count);
					}
				}

				ObjectNode readValue = objectMapper.readValue(res, ObjectNode.class);
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
				} else if (analysisStatus.equalsIgnoreCase(CANCELED)) {
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
				if (count < retryCount) {
					try {
						Thread.sleep(retryInterval * 60 * 1000);
						return getApprovalStatus(approvalUrl, user, outputs, count);
					} catch (InterruptedException e1){ }
				}
				logger.error("Error occurred while processing approval result ", e);
				outputs.put(EXCEPTION, String.format("Error occurred while processing, %s", e.getMessage()));
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
		} else  {
			return null;
		}
	}

	@Override
	public long getBackoffPeriod() {
		return TimeUnit.SECONDS.toMillis(5);
	}

	@Override
	public long getTimeout() {
		return TimeUnit.DAYS.toMillis(1);
	}

	@Override
	public TaskResult onTimeout(@NotNull StageExecution stage) {
		Map<String, Object> outputs = stage.getOutputs();
		String trigger = (String) outputs.getOrDefault(ApprovalTriggerTask.TRIGGER, "NOTYET");
		if (trigger.equals(ApprovalTriggerTask.SUCCESS) && outputs.get(ApprovalMonitorTask.STATUS) == null) {
			logger.info("Cancelling triggered approval gate as stage getting terminated");
			String approvalUrl = (String) outputs.get(ApprovalMonitorTask.LOCATION);
			approvalUrl = approvalUrl.replaceFirst("[^/]*$", "spinnakerReview");
			approvalUrl = approvalUrl.replaceFirst("/v2/", "/v1/");
			cancelRequest(approvalUrl, stage.getExecution().getAuthentication().getUser(),outputs, "exceeded its progress deadline");
			if (outputs.containsKey(ApprovalTriggerTask.NAVIGATIONAL_URL)) {
				stage.getOutputs().remove(ApprovalTriggerTask.NAVIGATIONAL_URL);
				stage.getOutputs().remove(ApprovalTriggerTask.APPROVAL_URL);
			}
		}
		return null;
	}
}