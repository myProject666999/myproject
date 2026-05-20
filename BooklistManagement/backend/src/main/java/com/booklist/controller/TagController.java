package com.booklist.controller;

import com.booklist.common.Result;
import com.booklist.dto.TagDTO;
import com.booklist.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TagController {

    private final TagService tagService;

    @GetMapping
    public Result<List<TagDTO>> findAll() {
        return Result.success(tagService.findAll());
    }

    @GetMapping("/{id}")
    public Result<TagDTO> findById(@PathVariable Long id) {
        return tagService.findById(id)
                .map(Result::success)
                .orElse(Result.error("Tag not found"));
    }

    @GetMapping("/name/{name}")
    public Result<TagDTO> findByName(@PathVariable String name) {
        return tagService.findByName(name)
                .map(Result::success)
                .orElse(Result.error("Tag not found with name: " + name));
    }

    @PostMapping
    public Result<TagDTO> create(@RequestBody TagDTO dto) {
        return Result.success(tagService.create(dto));
    }

    @PutMapping("/{id}")
    public Result<TagDTO> update(@PathVariable Long id, @RequestBody TagDTO dto) {
        return tagService.update(id, dto)
                .map(Result::success)
                .orElse(Result.error("Tag not found"));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        if (tagService.delete(id)) {
            return Result.success();
        }
        return Result.error("Tag not found");
    }
}
