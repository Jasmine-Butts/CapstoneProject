package com.app.Readscape.controller;

import com.app.Readscape.service.ai.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping ("/ai-test")
public class AiTestController {

    private final AiService aiService;

    public AiTestController(AiService aiService) {
        this.aiService = aiService;
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> testGemini() {

        String response = aiService.generateResponse("Explain the fanatasy genre in two sentences");

        return ResponseEntity.ok(response);

    }
    
}
