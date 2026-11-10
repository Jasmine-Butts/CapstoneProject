package com.app.Readscape.service.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import com.fasterxml.jackson.databind.JsonNode;

@Service 
public class BookCatalogClient {
    
    private final RestClient restClient;

    public BookCatalogClient(@Value ("${book.catalog.api.url}") String baseUrl) {
    
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    
    }

    public JsonNode searchBooks(String query) {

        return restClient.get().uri(uriBuilder -> uriBuilder
                .path("books/search")
                .queryParam("q", query)
                .build())
                .retrieve()
                .body(JsonNode.class);
    }

    public JsonNode getBooksById(String googleId) {

        return restClient.get().uri("/books/{id}", googleId)
                .retrieve()
                .body(JsonNode.class);
    }
}
