package com.app.Readscape.service;

import com.app.Readscape.entity.Role;
import com.app.Readscape.repo.*;
import org.springframework.stereotype.Service;

@Service
public class RoleService {
    
    private final ReadersRepo readersRepo;
    private final ModeratorsRepo moderatorsRepo;
    private final AdministratorsRepo administratorsRepo;

    public RoleService(ReadersRepo readersRepo, ModeratorsRepo moderatorsRepo, AdministratorsRepo administratorsRepo) {
        this.readersRepo = readersRepo;
        this.moderatorsRepo = moderatorsRepo;
        this.administratorsRepo = administratorsRepo;
    }

    // determines a user's system-wide role

    public Role getUserRole(Long userId) {
        
        boolean isReader = readersRepo.existsById(userId);
        boolean isModerator = moderatorsRepo.existsById(userId);
        boolean isAdministrator = administratorsRepo.existsById(userId);

        int roleCount =  (isReader ? 1 : 0) + (isModerator ? 1 : 0) + (isAdministrator ? 1 : 0);

        if (roleCount != 1) {
            throw new IllegalStateException("User must have exactly one system role");
        }

        if (isAdministrator) {
            return Role.ADMINISTRATOR;
        } else if (isModerator) {
            return Role.MODERATOR;
        } else if (isReader) {
            return Role.READER;
        } else {
            throw new IllegalStateException("User must have exactly one system role");
        }

    }

    // determines a user's role in a specific club

}
