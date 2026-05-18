package com.giftwishlist.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.giftwishlist.common.Result;
import com.giftwishlist.entity.User;
import com.giftwishlist.service.FriendshipService;
import com.giftwishlist.service.UserService;
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

    @Autowired
    private UserService userService;

    @GetMapping("/{userId}/friends")
    public Result<List<User>> getFriends(@PathVariable Long userId) {
        return Result.success(friendshipService.getFriends(userId));
    }

    @PostMapping
    public Result<Boolean> addFriend(@RequestBody Map<String, Object> params) {
        Long userId = Long.valueOf(params.get("userId").toString());
        String friendIdentifier = params.get("friendId") != null ? params.get("friendId").toString() : null;
        String friendUsername = params.get("friendUsername") != null ? params.get("friendUsername").toString() : null;

        Long friendId = null;
        if (friendIdentifier != null && !friendIdentifier.isEmpty()) {
            try {
                friendId = Long.parseLong(friendIdentifier);
            } catch (NumberFormatException e) {
                friendUsername = friendIdentifier;
            }
        }

        if (friendId == null && friendUsername != null && !friendUsername.isEmpty()) {
            User friend = userService.getOne(new QueryWrapper<User>().eq("username", friendUsername));
            if (friend == null) {
                return Result.error("用户不存在");
            }
            friendId = friend.getId();
        }

        if (friendId == null) {
            return Result.error("请输入好友的用户ID或用户名");
        }

        if (userId.equals(friendId)) {
            return Result.error("不能添加自己为好友");
        }

        boolean success = friendshipService.addFriend(userId, friendId);
        return success ? Result.success(true) : Result.error("添加好友失败，可能已经是好友");
    }
}
