package com.app.Readscape.controller;

import com.app.Readscape.dto.ai.BookRecommendationDTO;
import com.app.Readscape.dto.ai.ReadingProfileDTO;
import com.app.Readscape.service.ai.ReadingProfileService;
import com.app.Readscape.service.ai.RecommendationService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController 
@RequestMapping("/internal/recommendations")
public class InternalRecommendationController {
    
    private final ReadingProfileService profileService;
    private final RecommendationService recommendationService;

    public InternalRecommendationController(ReadingProfileService profileService, RecommendationService recommendationService) {
        this.profileService = profileService;
        this.recommendationService = recommendationService;
    }

    public record RecommendationRequest(Long userId) {}

    @PostMapping
    public ResponseEntity<List<BookRecommendationDTO>> recommend(@RequestBody RecommendationRequest request) {

        if (request.userId() == null || request.userId() <= 0) {
            return ResponseEntity.badRequest().build();
        }

        ReadingProfileDTO profile = profileService.getProfileByReaderId(request.userId());

        return ResponseEntity.ok(recommendationService.getBookRecommendations(profile, 5));

    }



}
