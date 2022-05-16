package com.opsmx.plugin.stage.custom;

public class VerificationContext {

	private String lifetime;
    private Integer minicanaryresult;
    private Integer canaryresultscore;
    private String imageids;
    private Boolean log;
    private Boolean metric;
    private Long baselinestarttime;
    private Long canarystarttime;
    
    public VerificationContext(){}

	public VerificationContext(String lifetime, Integer minicanaryresult, Integer canaryresultscore,
							   String imageids, Boolean log, Boolean metric, Long baselinestarttime, Long canarystarttime) {
		super();
		this.lifetime = lifetime;
		this.minicanaryresult = minicanaryresult;
		this.canaryresultscore = canaryresultscore;
		this.imageids = imageids;
		this.log = log;
		this.metric = metric;
		this.baselinestarttime = baselinestarttime;
		this.canarystarttime = canarystarttime;
	}

	public String getLifetime() {
		return lifetime;
	}

	public void setLifetime(String lifetime) {
		this.lifetime = lifetime;
	}

	public Integer getMinicanaryresult() {
		return minicanaryresult;
	}

	public void setMinicanaryresult(Integer minicanaryresult) {
		this.minicanaryresult = minicanaryresult;
	}

	public Integer getCanaryresultscore() {
		return canaryresultscore;
	}

	public void setCanaryresultscore(Integer canaryresultscore) {
		this.canaryresultscore = canaryresultscore;
	}

	public String getImageids() {
		return imageids;
	}

	public void setImageids(String imageids) {
		this.imageids = imageids;
	}

	public Boolean getLog() {
		return log;
	}

	public void setLog(Boolean log) {
		this.log = log;
	}

	public Boolean getMetric() {
		return metric;
	}

	public void setMetric(Boolean metric) {
		this.metric = metric;
	}

	public Long getBaselinestarttime() {
		return baselinestarttime;
	}

	public void setBaselinestarttime(Long baselinestarttime) {
		this.baselinestarttime = baselinestarttime;
	}

	public Long getCanarystarttime() {
		return canarystarttime;
	}

	public void setCanarystarttime(Long canarystarttime) {
		this.canarystarttime = canarystarttime;
	}
}
