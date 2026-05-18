package com.giftwishlist.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.giftwishlist.entity.Friendship;
import com.giftwishlist.entity.User;
import com.giftwishlist.mapper.FriendshipMapper;
import com.giftwishlist.mapper.UserMapper;
import com.giftwishlist.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendshipServiceImpl extends ServiceImpl<FriendshipMapper, Friendship> implements FriendshipService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public List<User> getFriends(Long userId) {
        QueryWrapper<Friendship> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("status", 1);
        List<Friendship> friendships = list(wrapper);
        if (friendships.isEmpty()) {
            return new ArrayList<>();
        }
        List<Long> friendIds = friendships.stream()
                .map(Friendship::getFriendId)
                .collect(Collectors.toList());
        return userMapper.selectBatchIds(friendIds);
    }

    @Override
    public boolean addFriend(Long userId, Long friendId) {
        QueryWrapper<Friendship> wrapper = new QueryWrapper<>();
        wrapper.eq("user_id", userId).eq("friend_id", friendId);
        Friendship exist = getOne(wrapper);
        if (exist != null) {
            return false;
        }
        Friendship f1 = new Friendship();
        f1.setUserId(userId);
        f1.setFriendId(friendId);
        f1.setStatus(1);
        f1.setCreatedAt(LocalDateTime.now());
        save(f1);

        Friendship f2 = new Friendship();
        f2.setUserId(friendId);
        f2.setFriendId(userId);
        f2.setStatus(1);
        f2.setCreatedAt(LocalDateTime.now());
        save(f2);

        return true;
    }
}
