package com.emojipack.controller;

import com.emojipack.common.Result;
import com.emojipack.entity.Tag;
import com.emojipack.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping
    public Result<List<Tag>> list() {
        return Result.success(tagService.list());
    }

    @GetMapping("/search")
    public Result<List<Tag>> search(@RequestParam String name) {
        return Result.success(tagService.searchByName(name));
    }
}
