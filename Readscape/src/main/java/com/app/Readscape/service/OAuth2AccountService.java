package com.app.Readscape.service;

import com.app.Readscape.entity.UserAccount;
import com.app.Readscape.entity.UserAuthProvider;
import com.app.Readscape.entity.Readers;
import com.app.Readscape.repo.UserRepo;
import com.app.Readscape.repo.UserAuthProviderRepo;
import com.app.Readscape.repo.ReadersRepo;
import com.app.Readscape.security.ReadscapeOidcUser;

import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service 
public class OAuth2AccountService extends OidcUserService {

    private final UserRepo userRepo;
    private final ReadersRepo readersRepo;
    private final UserAuthProviderRepo providerRepo;
    private final RoleService roleService;

    public OAuth2AccountService(UserRepo userRepo, ReadersRepo readersRepo, UserAuthProviderRepo providerRepo, RoleService roleService) {
        this.userRepo = userRepo;
        this.readersRepo = readersRepo;
        this.providerRepo = providerRepo;
        this.roleService = roleService;
    }

    @Override 
    @Transactional 
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {

        OidcUser googleUser = super.loadUser(userRequest);

        String googleId = googleUser.getSubject();
        String email = googleUser.getEmail();
        String name = googleUser.getName();

        Boolean verified = googleUser.getEmailVerified();

        if (googleId == null || email == null || !Boolean.TRUE.equals(verified)) {

            throw oauthError("invalid_google_account", "Google account information is invalid");
        }

        UserAuthProvider existingProvider = providerRepo.findByProviderAndProviderUserId("GOOGLE", googleId).orElse(null);

        UserAccount user;

        if (existingProvider != null) {

            user = existingProvider.getUser();
        } else {
            if (userRepo.existsByEmail(email)) {
                throw oauthError("account_link_required", "Please sign in to your existng Readscape account first");
            }

            user = new UserAccount();

            user.setEmail(email);
            user.setName(name != null ? name : email);
            user.setPasswordHash(null);
            user.setAccountStatus(UserAccount.AccountStatus.ACTIVE);

            String username;

            do {
                username = "reader_" + UUID.randomUUID().toString().replace("-", "").substring(0, 12);
            } while (userRepo.existsByUsername(username));

            user.setUsername(username);
            user = userRepo.save(user);

            Readers reader = new Readers();

            reader.setUserAccount(user);
            reader.setProfileVisibility(Readers.ProfileVisibility.PUBLIC);
            
            readersRepo.save(reader);

            UserAuthProvider provider = new UserAuthProvider(user, "GOOGLE", googleId);

            providerRepo.save(provider);

        }

        if (user.getAccountStatus() != UserAccount.AccountStatus.ACTIVE) {
            throw oauthError("account_disabled", "This Readscape account is not active.");
        }

        roleService.getUserRole(user.getId());

        return new ReadscapeOidcUser(googleUser, user);
    }

    private OAuth2AuthenticationException oauthError(String errorCode, String errorMessage) {
        return new OAuth2AuthenticationException(new OAuth2Error(errorCode, errorMessage, null));
    }

    
}
