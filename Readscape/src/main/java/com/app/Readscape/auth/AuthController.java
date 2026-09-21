package com.app.Readscape.auth;

import com.app.Readscape.auth.dto.*;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
