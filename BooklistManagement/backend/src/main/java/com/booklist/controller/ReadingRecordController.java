package com.booklist.controller;

import com.booklist.common.Result;
import com.booklist.dto.ReadingRecordDTO;
import com.booklist.service.ReadingRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reading-records")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReadingRecordController {

    private final ReadingRecordService readingRecordService;

    @GetMapping("/booklist/{bookListId}")
    public Result<List<ReadingRecordDTO>> findByBookListId(@PathVariable Long bookListId) {
        return Result.success(readingRecordService.findByBookListId(bookListId));
    }

    @GetMapping("/{id}")
    public Result<ReadingRecordDTO> findById(@PathVariable Long id) {
        return readingRecordService.findById(id)
                .map(Result::success)
                .orElse(Result.error("ReadingRecord not found"));
    }

    @PostMapping
    public Result<ReadingRecordDTO> create(@RequestBody ReadingRecordDTO dto) {
        return Result.success(readingRecordService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<ReadingRecordDTO> update(@PathVariable Long id, @RequestBody ReadingRecordDTO dto) {
        return readingRecordService.update(id, dto)
                .map(Result::success)
                .orElse(Result.error("ReadingRecord not found"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (readingRecordService.delete(id)) {
            return Result.success();
        }
        return Result.error("ReadingRecord not found");
    }
}
