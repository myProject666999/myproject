package com.booklist.controller;

import com.booklist.common.Result;
import com.booklist.dto.BookDTO;
import com.booklist.service.IsbnSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/isbn-search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class IsbnSearchController {

    private final IsbnSearchService isbnSearchService;

    @GetMapping("/{isbn}")
    public Result<BookDTO> searchByIsbn(@PathVariable String isbn) {
        return isbnSearchService.searchByIsbn(isbn)
                .map(Result::success)
                .orElse(Result.error("Book not found with ISBN: " + isbn));
    }
}
