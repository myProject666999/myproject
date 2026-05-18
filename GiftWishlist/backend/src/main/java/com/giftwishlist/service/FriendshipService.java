package com.giftwishlist.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.giftwishlist.entity.Friendship;
import com.giftwishlist.entity.User;
import java.util.List;

public interface FriendshipService extends IService<Friendship> {
    List<User> getFriends(Long userId);
    boolean addFriend(Long userId, Long friendId);
}
