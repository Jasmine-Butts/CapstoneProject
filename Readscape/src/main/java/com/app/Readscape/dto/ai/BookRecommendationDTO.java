package com.app.Readscape.dto.ai;

public record BookRecommendationDTO (
        String googleBooksId,
        String title,
        String author, 
        String description,
        String thumbnail,
        String recommendationReason
){}
