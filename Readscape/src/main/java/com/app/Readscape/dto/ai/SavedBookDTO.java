package com.app.Readscape.dto.ai;

import java.util.List;

public record SavedBookDTO(
    String googleBooksId,
    String title,
    List<String> authors,
    List<String> categories,
    String readingStatus,
    Integer currentPage
) {}
