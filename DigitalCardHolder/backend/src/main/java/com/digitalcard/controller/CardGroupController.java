package com.digitalcard.controller;

import com.digitalcard.common.Result;
import com.digitalcard.entity.CardGroup;
import com.digitalcard.service.CardGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/groups")
public class CardGroupController {
    @Autowired
    private CardGroupService cardGroupService;

    private final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public Result<List<CardGroup>> list() {
        return Result.success(cardGroupService.list(DEFAULT_USER_ID));
    }

    @GetMapping("/{id}")
    public Result<CardGroup> getById(@PathVariable Long id) {
        return Result.success(cardGroupService.getById(id, DEFAULT_USER_ID));
    }

    @PostMapping
    public Result<Void> save(@RequestBody CardGroup group) {
        group.setUserId(DEFAULT_USER_ID);
        cardGroupService.save(group);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody CardGroup group) {
        group.setUserId(DEFAULT_USER_ID);
        cardGroupService.update(group);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        cardGroupService.delete(id, DEFAULT_USER_ID);
        return Result.success();
    }
}
