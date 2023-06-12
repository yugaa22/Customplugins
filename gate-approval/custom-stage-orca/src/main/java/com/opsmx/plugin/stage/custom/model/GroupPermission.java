package com.opsmx.plugin.stage.custom.model;

import java.util.List;

public class GroupPermission {

    private boolean globalPermissionsEnabled;
    private List<UserGroupPermission> userGroups;

    public boolean isGlobalPermissionsEnabled() {
        return globalPermissionsEnabled;
    }

    public void setGlobalPermissionsEnabled(boolean globalPermissionsEnabled) {
        this.globalPermissionsEnabled = globalPermissionsEnabled;
    }

    public List<UserGroupPermission> getUserGroups() {
        return userGroups;
    }

    public void setUserGroups(List<UserGroupPermission> userGroups) {
        this.userGroups = userGroups;
    }
}
