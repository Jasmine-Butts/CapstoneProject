package com.app.Readscape.dto.auth;

public class RegisterRequest {
    
    private String name;
    private String username;
    private String email;
    private String passwordHash;

    public RegisterRequest(){
    
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
            this.name = name;
    }

    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
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
