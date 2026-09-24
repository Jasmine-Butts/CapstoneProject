package com.app.Readscape.controller;


import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.app.Readscape.service.AuthService;

@RestController 
@RequestMapping ("/auth")
public class AuthController {
    
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

   /* @PostMapping("/register")
     public ResponseEntity<AuthResponse> register(
        @RequestBody RegisterRequest request) {
            
        }
   */
}
