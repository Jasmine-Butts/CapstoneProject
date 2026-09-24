package com.app.Readscape.security;

import com.app.Readscape.entity.UserAccount;
import com.app.Readscape.repo.UserRepo;
import com.app.Readscape.service.RoleService;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.List;

@Service 
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepo userRepo;
    private final RoleService roleService;

    public CustomUserDetailsService(UserRepo userRepo, RoleService roleService) {
        this.userRepo = userRepo;
        this.roleService = roleService;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {


       UserAccount user = userRepo.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found :( "));

       String role = roleService.getUserRole(user.getId());

       SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
       
       return org.springframework.security.core.userdetails.User.builder()
               .username(user.getEmail())
               .password(user.getPasswordHash())
               .authorities(authority)
               .build();
    } 
}

