package com.app.Readscape.repo;

import com.app.Readscape.entity.Administrators;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AdministratorsRepo extends JpaRepository<Administrators, Long> {
    
    Optional<Administrators> findByAdminId(Long adminId);

    boolean existsByAdminId(Long adminId);

}
