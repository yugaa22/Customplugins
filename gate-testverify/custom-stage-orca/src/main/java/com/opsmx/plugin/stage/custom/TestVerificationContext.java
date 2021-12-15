package com.opsmx.plugin.stage.custom;

public class TestVerificationContext {

	private String gateurl;
    private String lifetime;
    private Integer minicanaryresult;
    private Integer canaryresultscore;
    private String gate;
    private String imageids;
    private Boolean log;
    private Long baselinestarttime;
    private Long canarystarttime;
    private String testrunkey;
    private String baselinetestrunid;
    private String newtestrunid;
    private String testruninfo;
    
    
    public TestVerificationContext(){}


	public TestVerificationContext(String gateurl, String lifetime, Integer minicanaryresult, Integer canaryresultscore,
			String gate, String imageids, Boolean log, Long baselinestarttime, Long canarystarttime,
			String testrunkey, String baselinetestrunid, String newtestrunid, String testruninfo) {
		super();
		this.gateurl = gateurl;
		this.lifetime = lifetime;
		this.minicanaryresult = minicanaryresult;
		this.canaryresultscore = canaryresultscore;
		this.gate = gate;
		this.imageids = imageids;
		this.log = log;
		this.baselinestarttime = baselinestarttime;
		this.canarystarttime = canarystarttime;
		this.testrunkey = testrunkey;
		this.baselinetestrunid = baselinetestrunid;
		this.newtestrunid = newtestrunid;
		this.testruninfo = testruninfo;
	}


	public String getGateurl() {
		return gateurl;
	}


	public void setGateurl(String gateurl) {
		this.gateurl = gateurl;
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


	public String getGate() {
		return gate;
	}


	public void setGate(String gate) {
		this.gate = gate;
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


	public String getTestrunkey() {
		return testrunkey;
	}


	public void setTestrunkey(String testrunkey) {
		this.testrunkey = testrunkey;
	}


	public String getBaselinetestrunid() {
		return baselinetestrunid;
	}


	public void setBaselinetestrunid(String baselinetestrunid) {
		this.baselinetestrunid = baselinetestrunid;
	}


	public String getNewtestrunid() {
		return newtestrunid;
	}


	public void setNewtestrunid(String newtestrunid) {
		this.newtestrunid = newtestrunid;
	}


	public String getTestruninfo() {
		return testruninfo;
	}


	public void setTestruninfo(String testruninfo) {
		this.testruninfo = testruninfo;
	}
}
