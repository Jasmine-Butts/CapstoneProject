package com.app.Readscape.service.ai;

import com.app.Readscape.dto.ai.BookRecommendationDTO;
import com.app.Readscape.dto.ai.ReadingProfileDTO;

import java.util.List;

public interface RecommendationService {
    
    List<BookRecommendationDTO> getBookRecommendations(ReadingProfileDTO profile, int limit);

}
