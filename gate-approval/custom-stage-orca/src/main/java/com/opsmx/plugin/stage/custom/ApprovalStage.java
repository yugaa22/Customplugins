package com.opsmx.plugin.stage.custom;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.spinnaker.orca.api.pipeline.CancellableStage;
import com.netflix.spinnaker.orca.api.pipeline.TaskResult;
import com.netflix.spinnaker.orca.api.pipeline.models.ExecutionStatus;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpPost;
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
import org.springframework.stereotype.Component;

import com.netflix.spinnaker.orca.api.pipeline.graph.StageDefinitionBuilder;
import com.netflix.spinnaker.orca.api.pipeline.graph.TaskNode;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;

import java.io.IOException;
import java.net.URI;
import java.util.HashMap;
import java.util.Map;

@Extension
@Component
public class ApprovalStage implements StageDefinitionBuilder, CancellableStage {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void taskGraph(@NotNull StageExecution stage, @NotNull TaskNode.Builder builder) {
		builder.withTask("approvalTrigger", ApprovalTriggerTask.class)
		.withTask("approvalMonitor", ApprovalMonitorTask.class);
	}

	@Override
	public Result cancel(StageExecution stage) {
		Map<String, Object> outputs = stage.getOutputs();
		Map<String, Object> contextMap = new HashMap<>();
		String trigger = (String) outputs.getOrDefault(ApprovalTriggerTask.TRIGGER, "NOTYET");
		Object status = outputs.get(ApprovalMonitorTask.STATUS);

		if (trigger.equals(ApprovalTriggerTask.SUCCESS) && outputs.get(ApprovalMonitorTask.STATUS) == null) {
			logger.info("Cancelling triggered approval gate as stage getting terminated");
			String approvalUrl = (String) outputs.get(ApprovalMonitorTask.LOCATION);
			approvalUrl = approvalUrl.replaceFirst("[^/]*$", "review");
			approvalUrl = approvalUrl.replaceFirst("/v2/", "/v1/");
			return cancelRequest(approvalUrl, stage.getExecution().getAuthentication().getUser(), outputs, stage.getExecution().getCancellationReason());

		}

		return null;
	}

	private Result cancelRequest(String approvalUrl, String user, Map<String, Object> outputs, String reason) {

		HttpPut request = new	HttpPut();
		request.setURI(URI.create(approvalUrl));

		ObjectNode finalJson = objectMapper.createObjectNode();
		finalJson.put("action", "cancel");
		finalJson.put("comment", reason);
		String payload = finalJson.toString();

		logger.info("approval cancel url : {}, payload:{}", approvalUrl, payload);

		CloseableHttpClient httpClient = HttpClients.createDefault();
		try {
			request.setHeader("Content-type", "application/json");
			request.setHeader("x-spinnaker-user", user);

			request.setEntity(new StringEntity(payload));
			CloseableHttpResponse response = httpClient.execute(request);

			HttpEntity entity = response.getEntity();
			String registerResponse = "";
			if (entity != null) {
				registerResponse = EntityUtils.toString(entity);
			}
			logger.info("Approval CANCEL response : {}", registerResponse);
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
		return null;
	}
}
