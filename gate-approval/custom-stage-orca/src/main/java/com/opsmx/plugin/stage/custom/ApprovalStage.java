package com.opsmx.plugin.stage.custom;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.netflix.spinnaker.orca.api.pipeline.CancellableStage;
import com.netflix.spinnaker.orca.api.pipeline.graph.StageDefinitionBuilder;
import com.netflix.spinnaker.orca.api.pipeline.graph.TaskNode;
import com.netflix.spinnaker.orca.api.pipeline.models.StageExecution;
import org.apache.http.HttpEntity;
import org.apache.http.client.methods.CloseableHttpResponse;
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

import java.io.IOException;
import java.util.Map;

@Extension
@Component
public class ApprovalStage implements StageDefinitionBuilder, CancellableStage {

	private final Logger logger = LoggerFactory.getLogger(getClass());

	@Autowired
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Override
	public void taskGraph(@NotNull StageExecution stage, @NotNull TaskNode.Builder builder) {
		builder.withTask("approvalTrigger", ApprovalTriggerTask.class)
		.withTask("approvalMonitor", ApprovalMonitorTask.class);
	}

	@Override
	public Result cancel(StageExecution stage) {
		Map<String, Object> outputs = stage.getOutputs();
		String trigger = (String) outputs.getOrDefault(ApprovalTriggerTask.TRIGGER, "NOTYET");

		if (trigger.equals(ApprovalTriggerTask.SUCCESS) && outputs.get(ApprovalMonitorTask.STATUS) == null) {
			logger.info("Cancelling triggered approval gate as stage getting terminated");
			String approvalUrl = (String) outputs.get(ApprovalMonitorTask.LOCATION);
			approvalUrl = approvalUrl.replaceFirst("[^/]*$", "spinnakerReview");
			approvalUrl = approvalUrl.replaceFirst("/v2/", "/v1/");
			cancelRequest(approvalUrl, stage.getExecution().getAuthentication().getUser(), stage.getExecution().getCancellationReason());
			if (outputs.containsKey(ApprovalTriggerTask.NAVIGATIONAL_URL)) {
				stage.getOutputs().remove(ApprovalTriggerTask.NAVIGATIONAL_URL);
				stage.getOutputs().remove(ApprovalTriggerTask.APPROVAL_URL);
			}
		}
		return null;
	}

	private void cancelRequest(String approvalUrl, String user, String reason) {
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
			logger.info("Approval CANCEL STATUS : {}", response.getStatusLine().getStatusCode());
			if (response.getStatusLine().getStatusCode() != 200) {
				Thread.sleep(10000);
				cancelRequest(approvalUrl, user, reason);
			}

			HttpEntity entity = response.getEntity();
			String registerResponse = "";
			if (entity != null) {
				registerResponse = EntityUtils.toString(entity);
			}
			logger.debug("Approval CANCEL response : {}", registerResponse);
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
	}
}
