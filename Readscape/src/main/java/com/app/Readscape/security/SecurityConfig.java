package com.app.Readscape.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.Customizer;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
public class SecurityConfig {
        
    private final CustomUserDetailsService userDetailsService;
    private final AuthFilter authFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService, AuthFilter authFilter) {
        this.userDetailsService = userDetailsService;
        this.authFilter = authFilter;
    }

    // password encoder

    @Bean 
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // authentication provider
    @Bean
    public AuthenticationProvider authenticationProvider(PasswordEncoder passwordEncoder) {
       
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);

        authProvider.setPasswordEncoder(passwordEncoder);

        return authProvider;
    }

    // authentication manager
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationProvider authenticationProvider) {
       return new ProviderManager(authenticationProvider);

    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    } 

    @Bean 
    public SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {
           
            http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                .authorizeHttpRequests(auth -> auth
                    .requestMatchers("/auth/**").permitAll()
                    .requestMatchers("/admin/**").hasRole("ADMINISTRATOR")
                    .requestMatchers("/moderator/**").hasAnyRole("MODERATOR", "ADMINISTRATOR")
                    .requestMatchers("/reader/**").hasAnyRole("READER", "MODERATOR", "ADMINISTRATOR")
                    .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider(passwordEncoder()))
                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }

    
}