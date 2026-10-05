package com.app.Readscape.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.app.Readscape.dto.admin.RoleChangeRequest;
import com.app.Readscape.service.AdministratorService;

@RestController 
@RequestMapping("/admin")
public class AdministratorController {
    
    private final AdministratorService administratorService;

    public AdministratorController(AdministratorService administratorService) {
        this.administratorService = administratorService;
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<Void> changeRole(@PathVariable Long userId, @RequestBody RoleChangeRequest request) {
        administratorService.changeSystemRole(userId, request.getNewRole());

        return ResponseEntity.noContent().build();
    }

}
