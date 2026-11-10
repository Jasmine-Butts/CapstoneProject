package com.app.Readscape.dto.ai;

import java.util.List;

public record ReadingProfileDTO (
        Long readerId,
        List<String> preferredGenres,
        List<String> finishedBooks,
        List<String> currentlyReading,
        List<String> favoriteAuthors
    ) {}

        
        
    

