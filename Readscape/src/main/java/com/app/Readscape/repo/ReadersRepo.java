package com.app.Readscape.repo;

import com.app.Readscape.entity.Readers;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ReadersRepo extends JpaRepository<Readers, Long>{
    
    Optional<Readers> findByReaderId(String readerId);
    Optional<Readers> findByProfileVisibility(String profileVisibility);

    boolean existsByReaderId(String readerId);
    boolean existsByProfileVisibility(String profileVisibility);

}
