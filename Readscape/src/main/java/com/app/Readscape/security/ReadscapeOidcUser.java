package com.app.Readscape.security;

import com.app.Readscape.entity.UserAccount;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import java.util.Collection;
import java.util.Map;

public class ReadscapeOidcUser implements OidcUser {
    
    private final OidcUser delegate;
    private final UserAccount user;

    public ReadscapeOidcUser(OidcUser delegate, UserAccount user) {
        this.delegate = delegate;
        this.user = user;
    }

    public UserAccount getUser() {
        return user;
    }


    @Override
    public Map<String, Object> getClaims() {
        return delegate.getClaims();
    }

    @Override
    public OidcUserInfo getUserInfo() {
        return delegate.getUserInfo();
    }

    @Override
    public OidcIdToken getIdToken() {
        return delegate.getIdToken();
    }

    @Override
    public Map<String, Object> getAttributes() {
        return delegate.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority>
            getAuthorities() {
        return delegate.getAuthorities();
    }

    @Override
    public String getName() {
        return delegate.getName();
    }

}
