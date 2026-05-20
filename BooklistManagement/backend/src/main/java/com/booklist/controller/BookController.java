package com.booklist.controller;

import com.booklist.common.Result;
import com.booklist.dto.BookDTO;
import com.booklist.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookController {

    private final BookService bookService;

    @GetMapping
    public Result<List<BookDTO>> findAll() {
        return Result.success(bookService.findAll());
    }

    @GetMapping("/{id}")
    public Result<BookDTO> findById(@PathVariable Long id) {
        return bookService.findById(id)
                .map(Result::success)
                .orElse(Result.error("Book not found"));
    }

    @GetMapping("/isbn/{isbn}")
    public Result<BookDTO> findByIsbn(@PathVariable String isbn) {
        return bookService.findByIsbn(isbn)
                .map(Result::success)
                .orElse(Result.error("Book not found with ISBN: " + isbn));
    }

    @PostMapping
    public Result<BookDTO> create(@RequestBody BookDTO dto) {
        return Result.success(bookService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<BookDTO> update(@PathVariable Long id, @RequestBody BookDTO dto) {
        return bookService.update(id, dto)
                .map(Result::success)
                .orElse(Result.error("Book not found"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (bookService.delete(id)) {
            return Result.success();
        }
        return Result.error("Book not found");
    }
}
