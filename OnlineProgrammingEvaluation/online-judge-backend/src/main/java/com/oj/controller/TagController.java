package com.oj.controller;

import com.oj.common.Result;
import com.oj.entity.Tag;
import com.oj.service.TagService;
import jakarta.annotation.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tag")
public class TagController {

    @Resource
    private TagService tagService;

    @GetMapping("/list")
    public Result<List<Tag>> getTagList() {
        return Result.success(tagService.getAllTags());
    }

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<Tag> createTag(@RequestBody Tag tag) {
        return Result.success(tagService.createTag(tag));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Result<String> deleteTag(@PathVariable Long id) {
        tagService.deleteTag(id);
        return Result.success("删除成功");
    }
}
