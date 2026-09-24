package com.app.Readscape.repo;

import com.app.Readscape.entity.Moderators;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ModeratorsRepo extends JpaRepository<Moderators, Long>{
    
    Optional<Moderators> findByModId(Long modId);

    boolean existsByModId(Long modId);
}
