package com.app.Readscape.dto.auth;

public class LoginRequest {

    private String email;
    private String passwordHash;

    public LoginRequest(){
    
    }
    
    public String getEmail() {
            return email;
        }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

}
