package com.app.Readscape.controller;

import com.app.Readscape.entity.UserAccount;
import com.app.Readscape.repo.UserRepo;
import com.app.Readscape.dto.auth.LoginRequest;
import com.app.Readscape.dto.auth.RegisterRequest;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.Readscape.service.AuthService;

import java.util.Optional;

@RestController 
@RequestMapping ("/auth")
public class AuthController {
    
    private final AuthService authService;
    private final UserRepo userRepo;

    public AuthController(AuthService authService, UserRepo userRepo) {
        this.authService = authService;
        this.userRepo = userRepo;
    }

    // test login logic, replace w JWT token auth and google oauth
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // test registration logic
   @PostMapping("/register")
     public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request)); 
    }
}
