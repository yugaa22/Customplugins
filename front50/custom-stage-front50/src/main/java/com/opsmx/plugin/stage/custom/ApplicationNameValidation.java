package com.opsmx.plugin.stage.custom;

import java.io.IOException;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.pf4j.Extension;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.netflix.spinnaker.front50.ApplicationPermissionsService;
import com.netflix.spinnaker.front50.model.application.Application;
import com.netflix.spinnaker.front50.validator.ApplicationValidationErrors;
import com.netflix.spinnaker.front50.validator.ApplicationValidator;
import com.netflix.spinnaker.kork.plugins.api.internal.SpinnakerExtensionPoint;
import com.netflix.spinnaker.kork.web.exceptions.ValidationException;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

@Extension
@Component
public class ApplicationNameValidation implements ApplicationValidator, SpinnakerExtensionPoint {

	private final Logger logger = LoggerFactory.getLogger(ApplicationNameValidation.class);

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
	public void validate(Application application, ApplicationValidationErrors validationErrors) {
		if (!isOpaEnabled) {
			logger.info("OPA not enabled, returning");
			return;
		}
		String finalInput = null;
		Response httpResponse;
		try {
			finalInput = getOpaInput(application);
			logger.debug("Verifying {} with OPA", finalInput);

			RequestBody requestBody = RequestBody.create(JSON, finalInput);
			String opaFinalUrl = String.format("%s/%s", opaUrl.endsWith("/") ? opaUrl.substring(0, opaUrl.length() - 1) : opaUrl, opaPolicyLocation.startsWith("/") ? opaPolicyLocation.substring(1) : opaPolicyLocation);

			logger.debug("OPA endpoint : {}", opaFinalUrl);
			String opaStringResponse;

			/* fetch the response from the spawned call execution */
			httpResponse = doPost(opaFinalUrl, requestBody);
			opaStringResponse = httpResponse.body().string();
			logger.info("OPA response: {}", opaStringResponse);
			if (isOpaProxy) {
				if (httpResponse.code() == 401 ) {
					JsonObject opaResponse = gson.fromJson(opaStringResponse, JsonObject.class);
					StringBuilder denyMessage = new StringBuilder();
					extractDenyMessage(opaResponse, denyMessage);
					String opaMessage = denyMessage.toString();
					if (StringUtils.isNotBlank(opaMessage)) {
						validationErrors.rejectValue(
								"name",
								"application.name.invalid with opa deny",
								Optional.ofNullable(opaMessage)
								.orElse("Application doesn't satisfy the policy specified"));
					} else {
						validationErrors.rejectValue(
								"name",
								"application.name.invalid","Application doesn't satisfy the policy specified");
					}
				} else if (httpResponse.code() != 200 ) {
					validationErrors.rejectValue(
							"name",
							"application.name.invalid",  httpResponse.message());;
				}
			}

		} catch (Exception e) {
			logger.error("Communication exception for OPA at {}: {}", this.opaUrl, e.toString());
			validationErrors.rejectValue(
					"name",
					"application.name.invalid", e.toString());
		}
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
}
