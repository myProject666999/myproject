package com.giftwishlist.controller;

import com.giftwishlist.common.Result;
import com.giftwishlist.entity.User;
import com.giftwishlist.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/friendships")
@CrossOrigin
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    @GetMapping("/{userId}/friends")
    public Result<List<User>> getFriends(@PathVariable Long userId) {
        return Result.success(friendshipService.getFriends(userId));
    }

    @PostMapping
    public Result<Boolean> addFriend(@RequestBody Map<String, Long> params) {
        Long userId = params.get("userId");
        Long friendId = params.get("friendId");
        boolean success = friendshipService.addFriend(userId, friendId);
        return success ? Result.success(true) : Result.error("添加好友失败");
    }
}
