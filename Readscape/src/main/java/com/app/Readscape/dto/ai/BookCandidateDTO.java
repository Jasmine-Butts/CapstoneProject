package com.app.Readscape.dto.ai;

import java.util.List;

public record BookCandidateDTO(

    String googleBooksId,
    String title,
    List<String> authors,
    String description,
    List<String> categories,
    String thumbnail
    
) {}

