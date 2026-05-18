package com.giftwishlist.controller;

import com.giftwishlist.common.Result;
import com.giftwishlist.entity.Item;
import com.giftwishlist.service.ItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/items")
@CrossOrigin
public class ItemController {

    @Autowired
    private ItemService itemService;

    @GetMapping("/wishlist/{wishlistId}")
    public Result<List<Item>> getByWishlistId(@PathVariable Long wishlistId) {
        return Result.success(itemService.getByWishlistId(wishlistId));
    }

    @GetMapping("/{id}")
    public Result<Item> getById(@PathVariable Long id) {
        return Result.success(itemService.getById(id));
    }

    @PostMapping
    public Result<Item> create(@RequestBody Item item) {
        item.setIsClaimed(0);
        itemService.save(item);
        return Result.success(item);
    }

    @PostMapping("/{id}/claim")
    public Result<Boolean> claim(@PathVariable Long id, @RequestBody Map<String, Object> params) {
        Long userId = Long.valueOf(params.get("userId").toString());
        Long ownerId = Long.valueOf(params.get("ownerId").toString());
        String message = params.get("message") != null ? params.get("message").toString() : "";
        boolean success = itemService.claimItem(id, userId, ownerId, message);
        return success ? Result.success(true) : Result.error("领取失败");
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Item item) {
        return Result.success(itemService.updateById(item));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(itemService.removeById(id));
    }
}
