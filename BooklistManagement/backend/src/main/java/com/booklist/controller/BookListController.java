package com.booklist.controller;

import com.booklist.common.Result;
import com.booklist.dto.BookListDTO;
import com.booklist.entity.BookListStatus;
import com.booklist.service.BookListService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/booklists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BookListController {

    private final BookListService bookListService;

    @GetMapping
    public Result<List<BookListDTO>> findAll() {
        return Result.success(bookListService.findAll());
    }

    @GetMapping("/status/{status}")
    public Result<List<BookListDTO>> findByStatus(@PathVariable BookListStatus status) {
        return Result.success(bookListService.findByStatus(status));
    }

    @GetMapping("/{id}")
    public Result<BookListDTO> findById(@PathVariable Long id) {
        return bookListService.findById(id)
                .map(Result::success)
                .orElse(Result.error("BookList not found"));
    }

    @PostMapping
    public Result<BookListDTO> create(@RequestBody BookListDTO dto) {
        return Result.success(bookListService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<BookListDTO> update(@PathVariable Long id, @RequestBody BookListDTO dto) {
        return bookListService.update(id, dto)
                .map(Result::success)
                .orElse(Result.error("BookList not found"));
    }

    @PatchMapping("/{id}/status")
    public Result<BookListDTO> updateStatus(@PathVariable Long id, @RequestParam BookListStatus status) {
        return bookListService.updateStatus(id, status)
                .map(Result::success)
                .orElse(Result.error("BookList not found"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (bookListService.delete(id)) {
            return Result.success();
        }
        return Result.error("BookList not found");
    }
}
