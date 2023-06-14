package com.opsmx.plugin.stage.custom.model;


public class ApplicationModel {

    private String appName;
    private Integer appId;
    private String serviceName;
    private Integer serviceId;
    private String pipelineName;
    private Integer pipelineId;
    private Boolean isCustomGateFound;

    public String getAppName() {
        return appName;
    }

    public void setAppName(String appName) {
        this.appName = appName;
    }

    public Integer getAppId() {
        return appId;
    }

    public void setAppId(Integer appId) {
        this.appId = appId;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public Integer getServiceId() {
        return serviceId;
    }

    public void setServiceId(Integer serviceId) {
        this.serviceId = serviceId;
    }

    public String getPipelineName() {
        return pipelineName;
    }

    public void setPipelineName(String pipelineName) {
        this.pipelineName = pipelineName;
    }

    public Integer getPipelineId() {
        return pipelineId;
    }

    public void setPipelineId(Integer pipelineId) {
        this.pipelineId = pipelineId;
    }

    public Boolean getCustomGateFound() {
        return isCustomGateFound;
    }

    public void setCustomGateFound(Boolean customGateFound) {
        isCustomGateFound = customGateFound;
    }

    @Override
    public String toString() {
        return "ApplicationModel{" +
                "appName='" + appName + '\'' +
                ", appId=" + appId +
                ", serviceName='" + serviceName + '\'' +
                ", serviceId=" + serviceId +
                ", pipelineName='" + pipelineName + '\'' +
                ", pipelineId=" + pipelineId +
                ", isCustomGateFound=" + isCustomGateFound +
                '}';
    }
}
