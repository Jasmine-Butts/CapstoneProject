package com.app.Readscape.security;
import com.app.Readscape.entity.Role;
import com.app.Readscape.entity.UserAccount;
import com.app.Readscape.repo.UserRepo;
import com.app.Readscape.service.RoleService;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import org.springframework.stereotype.Service;

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

        Role role = roleService.getUserRole(user.getId());


        //remove after testing
        System.out.println("========== AUTH DEBUG ==========");
        System.out.println("User ID: " + user.getId());
        System.out.println("Email: " + user.getEmail());
        System.out.println("Role: " + role);
        System.out.println("Authority: ROLE_" + role.name());
        System.out.println("================================");


        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.name());
        
        return org.springframework.security.core.userdetails.User.builder()
               .username(user.getEmail())
               .password(user.getPasswordHash())
               .authorities(authority)
               .build();
    } 
}

