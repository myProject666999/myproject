package com.booklist.service;

import com.booklist.dto.BookDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class IsbnSearchService {

    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${isbn.api.search-url}")
    private String searchUrl;

    public Optional<BookDTO> searchByIsbn(String isbn) {
        try {
            String url = searchUrl + "?q=isbn:" + isbn + "&maxResults=1";
            String response = webClientBuilder.build()
                    .get()
                    .uri(url)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(response);
            JsonNode items = root.get("items");

            if (items != null && items.isArray() && items.size() > 0) {
                JsonNode item = items.get(0);
                JsonNode volumeInfo = item.get("volumeInfo");

                BookDTO book = new BookDTO();
                book.setIsbn(isbn);
                book.setTitle(volumeInfo.has("title") ? volumeInfo.get("title").asText() : null);
                book.setSubtitle(volumeInfo.has("subtitle") ? volumeInfo.get("subtitle").asText() : null);

                if (volumeInfo.has("authors")) {
                    List<String> authors = new ArrayList<>();
                    volumeInfo.get("authors").forEach(author -> authors.add(author.asText()));
                    book.setAuthor(String.join(", ", authors));
                }

                book.setPublisher(volumeInfo.has("publisher") ? volumeInfo.get("publisher").asText() : null);

                if (volumeInfo.has("publishedDate")) {
                    String dateStr = volumeInfo.get("publishedDate").asText();
                    try {
                        if (dateStr.length() == 4) {
                            book.setPublishDate(LocalDate.of(Integer.parseInt(dateStr), 1, 1));
                        } else if (dateStr.length() == 7) {
                            String[] parts = dateStr.split("-");
                            book.setPublishDate(LocalDate.of(Integer.parseInt(parts[0]), Integer.parseInt(parts[1]), 1));
                        } else {
                            book.setPublishDate(LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE));
                        }
                    } catch (Exception e) {
                        log.warn("Failed to parse date: {}", dateStr);
                    }
                }

                book.setPages(volumeInfo.has("pageCount") ? volumeInfo.get("pageCount").asInt() : null);

                if (volumeInfo.has("imageLinks")) {
                    JsonNode imageLinks = volumeInfo.get("imageLinks");
                    if (imageLinks.has("thumbnail")) {
                        book.setCoverUrl(imageLinks.get("thumbnail").asText().replace("http://", "https://"));
                    } else if (imageLinks.has("smallThumbnail")) {
                        book.setCoverUrl(imageLinks.get("smallThumbnail").asText().replace("http://", "https://"));
                    }
                }

                book.setSummary(volumeInfo.has("description") ? volumeInfo.get("description").asText() : null);

                if (volumeInfo.has("industryIdentifiers")) {
                    for (JsonNode identifier : volumeInfo.get("industryIdentifiers")) {
                        if ("ISBN_13".equals(identifier.get("type").asText())) {
                            book.setIsbn(identifier.get("identifier").asText());
                            break;
                        }
                    }
                }

                return Optional.of(book);
            }
        } catch (Exception e) {
            log.error("Error searching ISBN: {}", isbn, e);
        }

        return Optional.empty();
    }
}
