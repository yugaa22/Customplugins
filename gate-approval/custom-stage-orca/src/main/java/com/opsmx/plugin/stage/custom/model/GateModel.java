package com.opsmx.plugin.stage.custom.model;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class GateModel {

    private String applicationId;
    private String pipelineName;
    @JsonProperty(value = "id")
    private Integer gateId;
    private String gateName;
    private String gateType;
    private Integer environmentId;
    private String logTemplateName;
    private String metricTemplateName;
    private List<String> dependsOn;
    private String nextStage;
    private String refId;
    private Integer approvalGateId;
    private Integer policyId;
    private String policyName;
    private List<Map<String, String>> payloadConstraint;

    @JsonProperty(value = "isAutomatedApproval")
    private Boolean isAutomatedApproval = false;

    @JsonProperty("approvalGatePolicies")
    private Set<ApprovalGatePolicy> approvalGatePolicies = new HashSet<>();

    private Integer pipelineId;
    private Integer serviceId;

    public String getApplicationId() {
        return applicationId;
    }

    public void setApplicationId(String applicationId) {
        this.applicationId = applicationId;
    }

    public String getPipelineName() {
        return pipelineName;
    }

    public void setPipelineName(String pipelineName) {
        this.pipelineName = pipelineName;
    }

    public Integer getGateId() {
        return gateId;
    }

    public void setGateId(Integer gateId) {
        this.gateId = gateId;
    }

    public String getGateName() {
        return gateName;
    }

    public void setGateName(String gateName) {
        this.gateName = gateName;
    }

    public String getGateType() {
        return gateType;
    }

    public void setGateType(String gateType) {
        this.gateType = gateType;
    }

    public Integer getEnvironmentId() {
        return environmentId;
    }

    public void setEnvironmentId(Integer environmentId) {
        this.environmentId = environmentId;
    }

    public String getLogTemplateName() {
        return logTemplateName;
    }

    public void setLogTemplateName(String logTemplateName) {
        this.logTemplateName = logTemplateName;
    }

    public String getMetricTemplateName() {
        return metricTemplateName;
    }

    public void setMetricTemplateName(String metricTemplateName) {
        this.metricTemplateName = metricTemplateName;
    }

    public List<String> getDependsOn() {
        return dependsOn;
    }

    public void setDependsOn(List<String> dependsOn) {
        this.dependsOn = dependsOn;
    }

    public String getNextStage() {
        return nextStage;
    }

    public void setNextStage(String nextStage) {
        this.nextStage = nextStage;
    }

    public String getRefId() {
        return refId;
    }

    public void setRefId(String refId) {
        this.refId = refId;
    }

    public Integer getApprovalGateId() {
        return approvalGateId;
    }

    public void setApprovalGateId(Integer approvalGateId) {
        this.approvalGateId = approvalGateId;
    }

    public Integer getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Integer policyId) {
        this.policyId = policyId;
    }

    public String getPolicyName() {
        return policyName;
    }

    public void setPolicyName(String policyName) {
        this.policyName = policyName;
    }

    public List<Map<String, String>> getPayloadConstraint() {
        return payloadConstraint;
    }

    public void setPayloadConstraint(List<Map<String, String>> payloadConstraint) {
        this.payloadConstraint = payloadConstraint;
    }

    public Boolean getIsAutomatedApproval() {
        return isAutomatedApproval;
    }

    public void setIsAutomatedApproval(Boolean isAutomatedApproval) {
        this.isAutomatedApproval = isAutomatedApproval;
    }

    public Set<ApprovalGatePolicy> getApprovalGatePolicies() {
        return approvalGatePolicies;
    }

    public void setApprovalGatePolicies(Set<ApprovalGatePolicy> approvalGatePolicies) {
        this.approvalGatePolicies = approvalGatePolicies;
    }

    public Integer getPipelineId() {
        return pipelineId;
    }

    public void setPipelineId(Integer pipelineId) {
        this.pipelineId = pipelineId;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public static class ApprovalGatePolicy {
        private Integer policyId;
        private String policyName;

        public Integer getPolicyId() {
            return policyId;
        }

        public void setPolicyId(Integer policyId) {
            this.policyId = policyId;
        }

        public String getPolicyName() {
            return policyName;
        }

        public void setPolicyName(String policyName) {
            this.policyName = policyName;
        }
    }

    @Override
    public String toString() {
        return "GateModel{" +
                "applicationId='" + applicationId + '\'' +
                ", pipelineName='" + pipelineName + '\'' +
                ", gateId=" + gateId +
                ", gateName='" + gateName + '\'' +
                ", gateType='" + gateType + '\'' +
                ", environmentId=" + environmentId +
                ", logTemplateName='" + logTemplateName + '\'' +
                ", metricTemplateName='" + metricTemplateName + '\'' +
                ", dependsOn=" + dependsOn +
                ", nextStage='" + nextStage + '\'' +
                ", refId='" + refId + '\'' +
                ", approvalGateId=" + approvalGateId +
                ", policyId=" + policyId +
                ", policyName='" + policyName + '\'' +
                ", payloadConstraint=" + payloadConstraint +
                ", isAutomatedApproval=" + isAutomatedApproval +
                ", approvalGatePolicies=" + approvalGatePolicies +
                ", pipelineId=" + pipelineId +
                ", serviceId=" + serviceId +
                '}';
    }
}
