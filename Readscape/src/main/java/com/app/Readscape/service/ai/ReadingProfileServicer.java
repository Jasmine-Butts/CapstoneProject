package com.app.Readscape.service.ai;

import com.app.Readscape.dto.ai.ReadingProfileDTO;
import com.app.Readscape.dto.ai.SavedBookDTO;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service 
public class ReadingProfileServicer implements ReadingProfileService {
    
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    public ReadingProfileServicer(JdbcTemplate jdbcTemplate, ObjectMapper objectMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public ReadingProfileDTO getProfileByEmail(String email) {

        Long readerId = jdbcTemplate.query(
            """
            SELECT id
            FROM readscape_users
            WHERE LOWER(email) = LOWER (?)
            """, rs -> rs.next() ? rs.getLong("id") : null,
                email
            );

            if (readerId == null) {
                throw new IllegalArgumentException("Reader not found: " + email);
            }

            return getProfileByReaderId(readerId);

    }

    @Override 
    public ReadingProfileDTO getProfileByReaderId(Long readerId) {
        List<SavedBookDTO> savedBooks = jdbcTemplate.query(
            """
            SELECT
                b.id AS google_books_id,
                b.title,
                b.authors::text AS authors,
                b.categories::text AS categories,
                ub.status,
                ub.current_page
            FROM readscape_user_books ub
            JOIN readscape_books b
                ON ub.book_id = b.id
            WHERE ub.user_id = ?
            ORDER BY ub.added_at DESC
            """, (rs, rowNum) -> new SavedBookDTO(
                rs.getString("google_books_id"),
                rs.getString("title"),
                parseJsonArray(rs.getString("authors")),
                parseJsonArray(rs.getString("categories")),
                rs.getString("status"),
                rs.getInt("current_page")
            ), readerId
        );

        List<String> finishedBooks = savedBooks.stream()
            .filter(book -> "finished".equals(book.readingStatus()))
            .map(SavedBookDTO::title)
            .toList();

        List<String> currentlyReading = savedBooks.stream()
            .filter(book -> "reading".equals(book.readingStatus()))
            .map(SavedBookDTO::title)
            .toList();

        List<String> preferredGenres = savedBooks.stream()
            .filter(book -> !"want".equals(book.readingStatus()))
            .flatMap(book -> book.categories().stream())
            .collect(Collectors.groupingBy(genre -> genre, Collectors.counting()))
            .entrySet()
            .stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(Map.Entry::getKey)
            .toList();

        List<String> favoriteAuthors = savedBooks.stream()
            .filter(book -> !"want".equals(book.readingStatus()))
            .flatMap(book -> book.authors().stream())
            .collect(Collectors.groupingBy(author -> author, Collectors.counting()))
            .entrySet()
            .stream()
            .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
            .limit(5)
            .map(Map.Entry::getKey)
            .toList();

        return new ReadingProfileDTO(
            readerId,
            preferredGenres,
            finishedBooks,
            savedBooks,
            currentlyReading,
            favoriteAuthors
        );
    }

    private List<String> parseJsonArray(String json) {

        if (json == null || json.isBlank()) {
            return List.of();
        }

        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            throw new IllegalStateException (
                "Unable to parse book metadata", e
            );
        }

    }
    
}
