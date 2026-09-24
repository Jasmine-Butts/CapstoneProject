package com.app.Readscape.repo;

import com.app.Readscape.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;


public interface UserRepo extends JpaRepository<UserAccount, Long> {
    
    Optional<UserAccount> findByEmail(String email);

    Optional<UserAccount> findByUsername(String username);

    Optional<UserAccount> findById(Long id);

    Optional<UserAccount> findByName(String name);

    Optional<UserAccount> findByAccountStatus(String accountStatus);

    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByName(String name);
    boolean existsByAccountStatus(String accountStatus);
    
}


