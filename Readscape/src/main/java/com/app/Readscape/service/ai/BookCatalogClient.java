package com.app.Readscape.service.ai;

import com.app.Readscape.dto.ai.BookCandidateDTO;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.ArrayList;
import java.util.List;

@Service 
public class BookCatalogClient {
    
    private final RestClient restClient;

    public BookCatalogClient(@Value ("${book.catalog.api.url}") String baseUrl) {
    
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    
    }

    public JsonNode searchBooks(String query) {

        return restClient.get().uri(uriBuilder -> uriBuilder
                .path("/api/books/search")
                .queryParam("q", query)
                .build())
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getBooksById(String googleBooksId) {

        return restClient.get().uri("/api/books/{id}", googleBooksId)
                .retrieve()
                .body(JsonNode.class);
    }

    public List<BookCandidateDTO> searchCandidates(String query) {
        JsonNode response = searchBooks(query);
        List<BookCandidateDTO> books = new ArrayList<>();

        if (response == null) {
            return books;
        }

        JsonNode items = response.isArray() ? response : response.has("books") ? response.path("books") : response.path("items");

        if (!items.isArray()) {
            throw new IllegalStateException("Unexpected book search format");
        }

        for (JsonNode book : items) {
            String googleBooksId = book.path("googleId").asText("");

            if (googleBooksId.isBlank()) {
                googleBooksId = book.path("id").asText("");
            }

            if (googleBooksId.isBlank()) {
                continue;
            }

            String thumbnail = book.path("thumbnail").asText("");

            if (thumbnail.isBlank()) {
                thumbnail = book.path("cover").asText("");
            }

            books.add(new BookCandidateDTO(
                googleBooksId,
                book.path("title").asText(""),
                readStrings(book.path("authors")),
                book.path("description").asText(""),
                readStrings(book.path("categories")),
                thumbnail
            ));

        }

        return books;

    }

    private List<String> readStrings(JsonNode node) {

        List<String> values = new ArrayList<>();

        if (node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual()) {
                    values.add(item.asText());
                }
            }
        }

        return values;
    }
}
