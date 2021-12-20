package com.opsmx.plugin.stage.custom;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.pf4j.Extension;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.google.common.collect.Lists;
import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.spinnaker.orca.api.pipeline.TaskResult;
import com.netflix.spinnaker.orca.api.pipeline.models.ExecutionStatus;
import com.netflix.spinnaker.orca.applications.utils.ApplicationNameValidator;
import com.netflix.spinnaker.orca.applications.utils.NameConstraint;
import com.netflix.spinnaker.orca.front50.model.Application;
import com.netflix.spinnaker.orca.front50.tasks.AbstractFront50Task;

import groovy.util.logging.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

@Extension
@Component
@Slf4j
public class UpsertApplicationTask extends AbstractFront50Task implements ApplicationNameValidator {

	@Value("${policy.opa.url:http://oes-server-svc.oes:8085}")
	private String opaUrl;

	@Value("${policy.opa.resultKey:deny}")
	private String opaResultKey;

	@Value("${policy.opa.policyLocation:/v1/staticPolicy/eval}")
	private String opaPolicyLocation;

	@Value("${policy.opa.enabled:false}")
	private boolean isOpaEnabled;

	@Value("${policy.opa.proxy:true}")
	private boolean isOpaProxy;

	@Value("${policy.opa.deltaVerification:false}")
	private boolean deltaVerification;

	private final Gson gson = new Gson();

	/* OPA spits JSON */
	private static final MediaType JSON = MediaType.parse("application/json; charset=utf-8");
	private final OkHttpClient opaClient = new OkHttpClient();	


	@Override
	public TaskResult performRequest(Application application) {

		if (!isOpaEnabled) {
//			logger.info("OPA not enabled, returning");
			return TaskResult.builder(ExecutionStatus.SUCCEEDED).build();
		}
		String finalInput = null;
		Response httpResponse;
		try {
			finalInput = getOpaInput(application);
//			logger.info("Verifying {} with OPA", finalInput);

			RequestBody requestBody = RequestBody.create(JSON, finalInput);
			String opaFinalUrl = String.format("%s/%s", opaUrl.endsWith("/") ? opaUrl.substring(0, opaUrl.length() - 1) : opaUrl, opaPolicyLocation.startsWith("/") ? opaPolicyLocation.substring(1) : opaPolicyLocation);

//			logger.info("OPA endpoint : {}", opaFinalUrl);
			String opaStringResponse;

			/* fetch the response from the spawned call execution */
			httpResponse = doPost(opaFinalUrl, requestBody);
			opaStringResponse = httpResponse.body().string();
//			logger.info("OPA response: {}", opaStringResponse);
			if (isOpaProxy) {
				if (httpResponse.code() == 401 ) {
					JsonObject opaResponse = gson.fromJson(opaStringResponse, JsonObject.class);
					StringBuilder denyMessage = new StringBuilder();
					extractDenyMessage(opaResponse, denyMessage);
					String opaMessage = denyMessage.toString();
					if (StringUtils.isNotBlank(opaMessage)) {
						 throw new IllegalArgumentException("Invalid application name, errors: " + opaMessage);
					} else {
						throw new IllegalArgumentException("Application doesn't satisfy the policy specified");
					}
				} else if (httpResponse.code() != 200 ) {
					throw new IllegalArgumentException("Application doesn't satisfy the policy specified "+ httpResponse.message());
				}
			}

		} catch (Exception e) {
//			logger.error("Communication exception for OPA at {}: {}", this.opaUrl, e.toString());
			return TaskResult.builder(ExecutionStatus.SUCCEEDED).build();
		}


		return null;
	}

	private void extractDenyMessage(JsonObject opaResponse, StringBuilder messagebuilder) {
		Set<Entry<String, JsonElement>> fields = opaResponse.entrySet();
		fields.forEach(field -> {
			if (field.getKey().equalsIgnoreCase(opaResultKey)) {
				JsonArray resultKey = field.getValue().getAsJsonArray();
				if (resultKey.size() != 0) {
					resultKey.forEach(result -> {
						if (StringUtils.isNotEmpty(messagebuilder)) {
							messagebuilder.append(", ");
						}
						messagebuilder.append(result.getAsString());
					});
				}
			}else if (field.getValue().isJsonObject()) {
				extractDenyMessage(field.getValue().getAsJsonObject(), messagebuilder);
			} else if (field.getValue().isJsonArray()){
				field.getValue().getAsJsonArray().forEach(obj -> {
					extractDenyMessage(obj.getAsJsonObject(), messagebuilder);
				});
			}
		});
	}


	private String getOpaInput(Application application) {

		JsonObject applicationJson = pipelineToJsonObject(application);

		String finalInput = gson.toJson(addWrapper(addWrapper(applicationJson, "app"), "input"));
		return finalInput;
	}

	private JsonObject pipelineToJsonObject(Application application) {
		String applicationStr = gson.toJson(application, Application.class);
		return gson.fromJson(applicationStr, JsonObject.class);
	}

	private JsonObject addWrapper(JsonObject pipeline, String wrapper) {
		JsonObject input = new JsonObject();
		input.add(wrapper, pipeline);
		return input;
	}
	
	private Response doPost(String url, RequestBody requestBody) throws IOException {
		Request req = (new Request.Builder()).url(url).post(requestBody).build();
		return getResponse(url, req);
	}

	private Response getResponse(String url, Request req) throws IOException {
		Response httpResponse = this.opaClient.newCall(req).execute();
		ResponseBody responseBody = httpResponse.body();
		if (responseBody == null) {
			throw new IOException("Http call yielded null response!! url:" + url);
		}
		return httpResponse;
	}

	public String getNotificationType() {
		return "upsertapplication";
	}

	@Override
	public Map<String, NameConstraint> getCloudProviderNameConstraints() {
		// TODO Auto-generated method stub
		return null;
	}

	@Override
	public void setCloudProviderNameConstraints(Map<String, NameConstraint> arg0) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public List<String> validate(Application application) {
		// TODO Auto-generated method stub
		return Lists.newArrayList();
	}
}
