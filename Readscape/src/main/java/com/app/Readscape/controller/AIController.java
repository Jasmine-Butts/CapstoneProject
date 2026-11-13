package com.app.Readscape.controller;

import com.app.Readscape.dto.ai.BookRecommendationDTO;
import com.app.Readscape.dto.ai.ReadingProfileDTO;

import com.app.Readscape.service.ai.AiService;
import com.app.Readscape.service.ai.ReadingProfileService;
import com.app.Readscape.service.ai.RecommendationService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;



@RestController 
@RequestMapping("/api/ai")
public class AIController {
    
    private final AiService aiService;
    private final ReadingProfileService readingProfileService;
    private final RecommendationService recommendationService;

    public AIController(AiService aiService, ReadingProfileService readingProfileService, RecommendationService recommendationService) {
        this.aiService = aiService;
        this.readingProfileService = readingProfileService;
        this.recommendationService = recommendationService;
    }

    @GetMapping("/recommendations")
    public ResponseEntity<List<BookRecommendationDTO>> getRecommendations(Authentication authentication) {

        String email = requireAuthenticatedUsername(authentication);

        ReadingProfileDTO profile = readingProfileService.getProfileByEmail(email);

        List<BookRecommendationDTO> recommendations = recommendationService.getBookRecommendations(profile, 5);

        return ResponseEntity.ok(recommendations);

    }

    // gemini assistant
    public record ChatRequest(
        @NotBlank 
        @Size(max = 4000) 
        String message
    ) {}

    public record ChatResponse(String response){}

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(Authentication authentication, @Valid @RequestBody ChatRequest request) {
        
        requireAuthenticatedUsername(authentication);

        String response = aiService.generateResponse(request.message);

        return ResponseEntity.ok(new ChatResponse(response));

    }

    private String requireAuthenticatedUsername(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()
            || authentication.getName() == null 
            || authentication.getName().isBlank()
            || "anonymousUser".equals(authentication.getName())) {
                
                throw new AuthenticationCredentialsNotFoundException("Authentication is required");

            }

            return authentication.getName();

    }
    


    

}
