package com.opsmx.plugin.stage.custom;

public enum StageType {

    VERIFICATION_GATE("verificationGate");

    private String type;

    public String getType()
    {
        return this.type;
    }

    private StageType(String type)
    {
        this.type = type;
    }
}
