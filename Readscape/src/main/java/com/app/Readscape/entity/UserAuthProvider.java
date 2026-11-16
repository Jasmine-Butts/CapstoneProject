package com.app.Readscape.entity;

import jakarta.persistence.*;

@Entity 
@Table(name = "user_auth_provider", uniqueConstraints = {
    @UniqueConstraint (columnNames = {"provider", "provider_user_id"}),
    @UniqueConstraint (columnNames = {"user_id", "provider"})
})
public class UserAuthProvider {
    
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccount user;

    @Column(name = "provider", nullable = false)
    private String provider;

    @Column(name = "provider_user_id", nullable = false)
    private String providerUserId;

    public UserAuthProvider() {}

    public UserAuthProvider(UserAccount user, String provider, String providerUserId) {
        this.user = user;
        this.provider = provider;
        this.providerUserId = providerUserId;
    }

    public Long getId() {
        return  id;
    }

    public UserAccount getUser() {
        return user;
    }

    public void setUser(UserAccount user) {
        this.user = user;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider (String provider) {
        this.provider = provider;
    }

    public String getProviderUserId (String providerUserId) {
        return providerUserId;
    }

    public void setProviderUserId(String providerUserId) {
        this.providerUserId = providerUserId;
    }


}

