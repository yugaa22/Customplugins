package com.opsmx.plugin.stage.custom;

public class PolicyContext {
	
	private String policyurl;
    
    private String policypath;
    
    private String gate;
    
    private String imageids;

    private String payload;

    public PolicyContext(){}

	public PolicyContext(String policyurl, String policypath, String gate, String imageids, String payload) {
		super();
		this.policyurl = policyurl;
		this.policypath = policypath;
		this.gate = gate;
		this.imageids = imageids;
		this.payload = payload;
	}

	public String getPolicyurl() {
		return policyurl;
	}

	public void setPolicyurl(String policyurl) {
		this.policyurl = policyurl;
	}

	public String getPolicypath() {
		return policypath;
	}

	public void setPolicypath(String policypath) {
		this.policypath = policypath;
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

	public String getPayload() {
		return payload;
	}

	public void setPayload(String payload) {
		this.payload = payload;
	}
}
