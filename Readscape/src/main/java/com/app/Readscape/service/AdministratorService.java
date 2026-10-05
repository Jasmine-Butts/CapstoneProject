package com.app.Readscape.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.app.Readscape.repo.*;
import com.app.Readscape.entity.*;

@Service 
public class AdministratorService {
    
    private final UserRepo userRepo;
    private final ReadersRepo readerRepo;
    private final ModeratorsRepo modRepo;
    private final AdministratorsRepo adminRepo;

    public AdministratorService(UserRepo userRepo, ReadersRepo readerRepo, ModeratorsRepo modRepo, AdministratorsRepo adminRepo) {
        this.userRepo = userRepo;
        this.readerRepo = readerRepo;
        this.modRepo = modRepo;
        this.adminRepo = adminRepo;
    }

    @Transactional 
    public void changeSystemRole(long userId, Role newRole) {

        UserAccount user = userRepo.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));

        readerRepo.deleteById(userId);
        modRepo.deleteById(userId);
        adminRepo.deleteById(userId);

        switch (newRole) {
            case READER -> {
                Readers reader = new Readers();

                reader.setUserAccount(user);
                readerRepo.save(reader);
            }
            case MODERATOR -> {
                Moderators mod = new Moderators();

                mod.setUserAccount(user);
                modRepo.save(mod);
            }
            case ADMINISTRATOR -> {
                Administrators admin = new Administrators();

                admin.setUserAccount(user);
                adminRepo.save(admin);
            }
        }
    }

}
