package com.opsmx.plugin.stage.custom.model;

public class UserGroup {
    private int userGroupId;
    private String userGroupName;
    private Boolean isAdmin;
    private Boolean isSuperAdmin;

    public int getUserGroupId() {
        return userGroupId;
    }

    public void setUserGroupId(int userGroupId) {
        this.userGroupId = userGroupId;
    }

    public String getUserGroupName() {
        return userGroupName;
    }

    public void setUserGroupName(String userGroupName) {
        this.userGroupName = userGroupName;
    }

    public Boolean getAdmin() {
        return isAdmin;
    }

    public void setAdmin(Boolean admin) {
        isAdmin = admin;
    }

    public Boolean getSuperAdmin() {
        return isSuperAdmin;
    }

    public void setSuperAdmin(Boolean superAdmin) {
        isSuperAdmin = superAdmin;
    }
}
