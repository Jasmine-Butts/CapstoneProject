package com.app.Readscape.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity 
@Table(name = "administrators")
public class Administrators {
    
    @Id
    @Column(name = "admin_id")
    private Long adminId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "admin_id")
    private UserAccount userAccount;

    @Column(name = "assigned_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private UserAccount assignedBy;

    public Administrators(){}

    // setters and getters
    
    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public UserAccount getUserAccount() {
        return userAccount;
    }

    public void setUserAccount(UserAccount userAccount) {
        this.userAccount = userAccount;
    }

    public OffsetDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(OffsetDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public UserAccount getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(UserAccount assignedBy) {
        this.assignedBy = assignedBy;
    }
    

}
