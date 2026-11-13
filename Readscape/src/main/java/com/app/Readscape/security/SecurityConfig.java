package com.app.Readscape.security;

import com.app.Readscape.repo.UserRepo;
import com.app.Readscape.security.AuthFilter;
import com.app.Readscape.security.InternalServiceAuthFilter;
import com.app.Readscape.security.OAuth2SuccessHandler;
import com.app.Readscape.security.CustomUserDetailsService;
import com.app.Readscape.service.OAuth2AccountService;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider; 

import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.security.oauth2.client.web.HttpSessionOAuth2AuthorizationRequestRepository;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;


@Configuration
public class SecurityConfig {
        
    private final InternalServiceAuthFilter internalServiceAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    private final AuthFilter authFilter;
    private final OAuth2AccountService oAuth2AccountService;
    private final OAuth2SuccessHandler oAuth2LoginSuccessHandler;
    

    public SecurityConfig(InternalServiceAuthFilter internalServiceAuthFilter, CustomUserDetailsService userDetailsService, AuthFilter authFilter, OAuth2AccountService oAuth2AccountService, OAuth2SuccessHandler oAuth2LoginSuccessHandler) {
        this.internalServiceAuthFilter = internalServiceAuthFilter;
        this.userDetailsService = userDetailsService;
        this.authFilter = authFilter;
        this.oAuth2AccountService = oAuth2AccountService;
        this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
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

    // google oauth req handling
    @Bean 
    public HttpSessionOAuth2AuthorizationRequestRepository authorizationRequestRepository() {
        return new HttpSessionOAuth2AuthorizationRequestRepository();
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
    public SecurityFilterChain securityFilterChain(HttpSecurity http, HttpSessionOAuth2AuthorizationRequestRepository authorizationRequestRepository)
        throws Exception {
           
            http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)

                .sessionManagement(session -> session
                    .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                )
                
                .authorizeHttpRequests(auth -> auth

                    .requestMatchers("/auth/**").permitAll()
                    .requestMatchers("/admin/**").hasAuthority("ROLE_ADMINISTRATOR")
                    .requestMatchers("/users/role").hasAuthority("ROLE_ADMINISTRATOR")
                    .requestMatchers("/moderator/**").hasAnyAuthority("ROLE_MODERATOR", "ROLE_ADMINISTRATOR")
                    .requestMatchers("/reader/**").hasAnyAuthority("ROLE_READER", "ROLE_MODERATOR", "ROLE_ADMINISTRATOR")
                    .requestMatchers("/recommendations/**").authenticated()
                    .requestMatchers("/ai-test/**").authenticated()
                    .requestMatchers("/internal/**").hasAuthority("ROLE_INTERNAL_SERVICE")

                    .anyRequest().authenticated()
                )

                .oauth2Login(oauth2 -> oauth2
                    .authorizationEndpoint(authorization -> authorization.authorizationRequestRepository(authorizationRequestRepository))
                    .userInfoEndpoint(userInfo -> userInfo
                        .oidcUserService(oAuth2AccountService)
                    )
                    .successHandler(oAuth2LoginSuccessHandler)
                    .failureHandler((request, response, exception) -> {
                        response.sendRedirect("http://localhost:5173/login?error=oauth");
                    })
                )

                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .addFilterBefore(internalServiceAuthFilter, AuthFilter.class)
                .addFilterBefore(authFilter, UsernamePasswordAuthenticationFilter.class);

            return http.build();
        }

    
}