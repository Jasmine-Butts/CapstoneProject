package com.app.Readscape.dto.auth;

public class AuthResponse {
    
    private String token;

    public AuthResponse() {
    }

    public void setToken(String token) {
        this.token = token;
    }
    public String getToken() {
        return token;
    }

}
