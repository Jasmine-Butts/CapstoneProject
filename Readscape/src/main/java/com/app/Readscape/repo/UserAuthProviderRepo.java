package com.app.Readscape.repo;

import com.app.Readscape.entity.UserAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserAuthProviderRepo extends JpaRepository<UserAuthProvider, Long> {

    Optional<UserAuthProvider> findByProviderAndProviderUserId(String provider, String providerUserId);

    boolean existsByUser_IdAndProvider(Long userId, String provider);
    
}
