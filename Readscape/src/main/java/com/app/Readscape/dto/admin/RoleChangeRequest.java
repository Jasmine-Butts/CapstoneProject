package com.app.Readscape.dto.admin;

import com.app.Readscape.entity.Role;

public class RoleChangeRequest {

    private Long userId;
    private Role newRole;

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Role getNewRole() {
        return newRole;
    }

    public void setNewRole(Role newRole) {
        this.newRole = newRole;
    }
    
    
}
