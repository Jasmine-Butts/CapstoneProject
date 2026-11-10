package com.app.Readscape.service.ai;

import com.app.Readscape.dto.ai.BookRecommendationDTO;
import com.app.Readscape.dto.ai.ReadingProfileDTO;

import java.util.List;

public interface ReadingProfileService {
    
    ReadingProfileDTO getProfileByUsername(String username);

}
