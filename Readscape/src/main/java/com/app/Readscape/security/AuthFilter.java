package com.app.Readscape.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class AuthFilter extends OncePerRequestFilter  {
    
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public AuthFilter(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override 
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        
        // temp debug logic
        System.out.println("=========== AUTH FILTER RUNNING ===========");
        System.out.println("METHOD: " + request.getMethod());
        System.out.println("REQUEST URI: " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");

        System.out.println("Bearer header present: " + (authHeader != null && authHeader.startsWith("Bearer ")));

        System.out.println("AUTH HEADER EXISTS: " + (authHeader != null));

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("NO VALID BEARER HEADER");
            filterChain.doFilter(request, response);

            return;
        }

        String jwt = authHeader.substring(7);

        String email;

        try {
            email = jwtService.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);

            return;
        }

        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                System.out.println("JWT validation successful");
            }

            System.out.println("Authenticated authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        }

        filterChain.doFilter(request, response);
    }

}
