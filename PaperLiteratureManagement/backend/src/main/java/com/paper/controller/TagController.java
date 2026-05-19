package com.paper.controller;

import com.paper.dto.ApiResponse;
import com.paper.dto.TagDTO;
import com.paper.dto.TagRequest;
import com.paper.service.TagService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @GetMapping
    public ApiResponse<List<TagDTO>> findAll() {
        return ApiResponse.success(tagService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<TagDTO> findById(@PathVariable Long id) {
        return ApiResponse.success(tagService.findById(id));
    }

    @PostMapping
    public ApiResponse<TagDTO> create(@Valid @RequestBody TagRequest request) {
        return ApiResponse.success("创建成功", tagService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<TagDTO> update(@PathVariable Long id, @Valid @RequestBody TagRequest request) {
        return ApiResponse.success("更新成功", tagService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ApiResponse.success("删除成功", null);
    }
}
