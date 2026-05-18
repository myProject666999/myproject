package com.giftwishlist.controller;

import com.giftwishlist.common.Result;
import com.giftwishlist.entity.User;
import com.giftwishlist.entity.Wishlist;
import com.giftwishlist.service.UserService;
import com.giftwishlist.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/wishlists")
@CrossOrigin
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;

    @Autowired
    private UserService userService;

    @GetMapping("/user/{userId}")
    public Result<List<Wishlist>> getByUserId(@PathVariable Long userId) {
        return Result.success(wishlistService.getByUserId(userId));
    }

    @GetMapping("/{id}")
    public Result<Wishlist> getById(@PathVariable Long id) {
        return Result.success(wishlistService.getById(id));
    }

    @PostMapping
    public Result<Wishlist> create(@RequestBody Wishlist wishlist) {
        if (wishlist.getUserId() == null) {
            return Result.error("用户ID不能为空");
        }
        User user = userService.getById(wishlist.getUserId());
        if (user == null) {
            return Result.error("用户不存在，请重新登录");
        }
        wishlistService.save(wishlist);
        return Result.success(wishlist);
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Wishlist wishlist) {
        return Result.success(wishlistService.updateById(wishlist));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(wishlistService.removeById(id));
    }
}
