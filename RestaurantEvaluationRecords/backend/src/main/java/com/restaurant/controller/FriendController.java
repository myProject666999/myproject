package com.restaurant.controller;

import com.restaurant.common.Result;
import com.restaurant.entity.User;
import com.restaurant.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @GetMapping("/{userId}")
    public Result<List<User>> getFriends(@PathVariable Long userId) {
        return Result.success(friendService.getFriends(userId));
    }

    @PostMapping
    public Result<Void> addFriend(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        Long friendId = request.get("friendId");
        try {
            friendService.addFriend(userId, friendId);
            return Result.success();
        } catch (RuntimeException e) {
            return Result.error(e.getMessage());
        }
    }

    @DeleteMapping
    public Result<Void> removeFriend(@RequestParam Long userId, @RequestParam Long friendId) {
        friendService.removeFriend(userId, friendId);
        return Result.success();
    }

    @GetMapping("/check")
    public Result<Boolean> isFriend(@RequestParam Long userId, @RequestParam Long friendId) {
        return Result.success(friendService.isFriend(userId, friendId));
    }
}
