package com.app.Readscape.controller;

import com.app.Readscape.dto.ai.BookRecommendationDTO;
import com.app.Readscape.dto.ai.ReadingProfileDTO;
import com.app.Readscape.service.ai.ReadingProfileService;
import com.app.Readscape.service.ai.RecommendationService;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController @RequestMapping ("/recommendations")
public class RecommendationController {
    
    private final RecommendationService recommendationService;
    private final ReadingProfileService readingProfileService;

    public RecommendationController(RecommendationService recommendationService, ReadingProfileService readingProfileService) {
        this.recommendationService = recommendationService;
        this.readingProfileService = readingProfileService;
    }

    @GetMapping
    public ResponseEntity<List<BookRecommendationDTO>> getRecommendations(Principal principal) {
       
        ReadingProfileDTO profile = readingProfileService.getProfileByUsername(principal.getName());
       
        List<BookRecommendationDTO> results = recommendationService.getBookRecommendations(profile, 5);
       
        return ResponseEntity.ok(results);
    }
    

}
