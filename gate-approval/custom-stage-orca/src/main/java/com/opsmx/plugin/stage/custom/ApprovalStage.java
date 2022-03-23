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
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
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

//	private void cancelResult2(String approvalUrl, String user, Map<String, Object> outputs, String reason) {
//
//		try {
//			ObjectNode finalJson = objectMapper.createObjectNode();
//			finalJson.put("action", "cancel");
//			finalJson.put("comment", reason);
//			String payload = objectMapper.writeValueAsString(finalJson);
//
//			logger.info("Request payload : {}", payload);
//
//			HttpClient client = HttpClient.newHttpClient();
//			HttpRequest request = HttpRequest
//					.newBuilder()
//					.uri(URI.create(approvalUrl))
//					.PUT(HttpRequest.BodyPublishers.ofString(payload))
//					.header("Content-type", "application/json")
//					.header("x-spinnaker-user", user)
//					.build();
//
//			HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
//
//			logger.info("Response of CANCEL  STATUS: {}, response : {}", response.statusCode(), response.body());
//		} catch (IOException | InterruptedException e) {
//			logger.info("Exception occurred while canceling approval request");
//		}
//	}

	private Result cancelRequest(String approvalUrl, String user, Map<String, Object> outputs, String reason) {

		HttpPut request = new	HttpPut(approvalUrl);
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

			logger.info("APPROVAL CANCEL STATUS : {}", response.getStatusLine().getStatusCode());

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
