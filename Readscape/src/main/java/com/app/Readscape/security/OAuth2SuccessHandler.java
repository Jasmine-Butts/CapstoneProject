package com.app.Readscape.security;

import com.app.Readscape.entity.UserAccount;
import com.app.Readscape.entity.Role;
import com.app.Readscape.service.RoleService;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;


import java.io.IOException;

@Component 
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler{
    
    private final JwtService jwtService;
    private final RoleService roleService;

    @Value ("${app.frontend.url:http//localhost:5173}")
    private String frontendUrl;

    @Value ("${jwt.expiration}")
    private Long jwtExpiration;

    public OAuth2SuccessHandler(JwtService jwtService, RoleService roleService) {
        this.jwtService = jwtService;
        this.roleService = roleService;
    }

    @Override 
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        ReadscapeOidcUser oidcUser = (ReadscapeOidcUser) authentication.getPrincipal();

        UserAccount user = oidcUser.getUser();

        Role role = roleService.getUserRole(user.getId());

        String token = jwtService.generateToken(user.getEmail(), role);

        int maxAge = Math.toIntExact(jwtExpiration / 1000);

        ResponseCookie cookie = ResponseCookie
                .from("readscape_token", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(maxAge)
                .sameSite("None")
                .build();
        
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        response.sendRedirect(frontendUrl + "/dashboard");
    }

}
