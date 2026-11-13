package com.app.Readscape.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import  java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

@Component 
public class InternalServiceAuthFilter extends OncePerRequestFilter {
    
    private final String internalKey;

    public  InternalServiceAuthFilter(@Value("${book.catalog.internal-key}") String internalKey) {
        this.internalKey = internalKey;
    }

    @Override 
    protected boolean shouldNotFilter(HttpServletRequest request) {
        return !request.getServletPath().startsWith("/internal/");
    }

    @Override 
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) 
                                      throws ServletException, IOException{


        String received = request.getHeader("X-Internal-API-Key");

        boolean valid = received != null && !internalKey.isBlank() && MessageDigest.isEqual(
            received.getBytes(StandardCharsets.UTF_8),
            internalKey.getBytes(StandardCharsets.UTF_8)
        );

        if (!valid) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        var authentication = new UsernamePasswordAuthenticationToken(
            "node-internal-service", null, List.of(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"))
        );

        try {
            SecurityContextHolder.getContext().setAuthentication(authentication);

            chain.doFilter(request, response);
        } finally {
            SecurityContextHolder.clearContext();
        }

    }

}
