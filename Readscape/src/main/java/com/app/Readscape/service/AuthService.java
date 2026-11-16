package com.app.Readscape.service;

import com.app.Readscape.dto.auth.RegisterRequest;
import com.app.Readscape.entity.UserAccount;
import com.app.Readscape.entity.UserAccount.AccountStatus;
import com.app.Readscape.entity.Readers;
import com.app.Readscape.entity.Role;
import com.app.Readscape.repo.UserRepo;
import com.app.Readscape.repo.ReadersRepo;
import com.app.Readscape.dto.auth.AuthResponse;
import com.app.Readscape.dto.auth.LoginRequest;
import com.app.Readscape.security.JwtService;
import com.app.Readscape.service.RoleService;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service 
public class AuthService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final ReadersRepo readersRepo;
    private final JwtService jwtService;
    private final RoleService roleService;

    public AuthService(UserRepo userRepo, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, ReadersRepo readersRepo, JwtService jwtService, RoleService roleService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.readersRepo = readersRepo;
        this.jwtService = jwtService;
        this.roleService = roleService;
    }

    @Transactional 
    public AuthResponse register(RegisterRequest request) {
        
        if (userRepo.existsByUsername((request.getUsername())) || userRepo.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Username or email already exists");
        }

        String encodedPassword = passwordEncoder.encode(request.getPasswordHash());

        UserAccount user = new UserAccount();

        user.setName(request.getName());
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(encodedPassword);
        user.setAccountStatus(AccountStatus.ACTIVE);

        userRepo.save(user);

        Readers reader = new Readers();

        reader.setUserAccount(user);
        reader.setProfileVisibility(Readers.ProfileVisibility.PUBLIC);
        
        readersRepo.save(reader);

        return new AuthResponse(null, user.getId(), user.getUsername(), user.getEmail(), Role.READER.name());
    }

    public AuthResponse login(LoginRequest request) {
       
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPasswordHash()));
       
        UserAccount user = userRepo.findByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleService.getUserRole(user.getId());

        String token = jwtService.generateToken(user.getEmail(), role);

        if (!passwordEncoder.matches(request.getPasswordHash(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        return new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail(), role.name());
    }
    
}
