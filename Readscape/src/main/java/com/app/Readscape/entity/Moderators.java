package com.app.Readscape.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity 
@Table(name = "moderators")
public class Moderators {
    
    @Id
    @Column(name = "mod_id")
    private Long modId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "mod_id")
    private UserAccount userAccount;

    @Column(name = "assigned_at", nullable = false, insertable = false, updatable = false)
    private OffsetDateTime assignedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by")
    private UserAccount assignedBy;

    public Moderators(){}

    // setters and getters
    
    public Long getModId() {
        return modId;
    }

    public void setModId(Long modId) {
        this.modId = modId;
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
