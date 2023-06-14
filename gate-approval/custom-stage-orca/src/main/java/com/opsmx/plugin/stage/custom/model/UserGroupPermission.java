package com.opsmx.plugin.stage.custom.model;

import java.util.List;

public class UserGroupPermission {

    private List<UserGroup> userGroupNames;
    private List<String> permissionIds;

    public List<UserGroup> getUserGroupNames() {
        return userGroupNames;
    }

    public void setUserGroupNames(List<UserGroup> userGroupNames) {
        this.userGroupNames = userGroupNames;
    }

    public List<String> getPermissionIds() {
        return permissionIds;
    }

    public void setPermissionIds(List<String> permissionIds) {
        this.permissionIds = permissionIds;
    }
}
