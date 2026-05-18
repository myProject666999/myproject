package com.digitalcard.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.digitalcard.common.Result;
import com.digitalcard.entity.Card;
import com.digitalcard.service.CardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cards")
public class CardController {
    @Autowired
    private CardService cardService;

    private final Long DEFAULT_USER_ID = 1L;

    @GetMapping
    public Result<IPage<Card>> list(
            @RequestParam(required = false) Long groupId,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") Integer pageNum,
            @RequestParam(defaultValue = "10") Integer pageSize) {
        return Result.success(cardService.list(DEFAULT_USER_ID, groupId, keyword, pageNum, pageSize));
    }

    @GetMapping("/all")
    public Result<List<Card>> listAll() {
        return Result.success(cardService.listAll(DEFAULT_USER_ID));
    }

    @GetMapping("/{id}")
    public Result<Card> getById(@PathVariable Long id) {
        return Result.success(cardService.getById(id, DEFAULT_USER_ID));
    }

    @PostMapping
    public Result<Void> save(@RequestBody Card card) {
        card.setUserId(DEFAULT_USER_ID);
        if (card.getIsFavorite() == null) {
            card.setIsFavorite(false);
        }
        cardService.save(card);
        return Result.success();
    }

    @PutMapping
    public Result<Void> update(@RequestBody Card card) {
        card.setUserId(DEFAULT_USER_ID);
        cardService.update(card);
        return Result.success();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        cardService.delete(id, DEFAULT_USER_ID);
        return Result.success();
    }

    @PutMapping("/{id}/favorite")
    public Result<Void> toggleFavorite(@PathVariable Long id) {
        cardService.toggleFavorite(id, DEFAULT_USER_ID);
        return Result.success();
    }
}
