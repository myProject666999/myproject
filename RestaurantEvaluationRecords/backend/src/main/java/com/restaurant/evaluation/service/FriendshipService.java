package com.restaurant.evaluation.service;

import com.restaurant.evaluation.common.Result;
import com.restaurant.evaluation.mapper.FriendshipMapper;
import com.restaurant.evaluation.util.UserContext;
import com.restaurant.evaluation.vo.UserVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FriendshipService {

    @Autowired
    private FriendshipMapper friendshipMapper;

    public Result<List<UserVO>> getFriendList() {
        Long userId = UserContext.getUserId();
        List<UserVO> friends = friendshipMapper.selectFriends(userId);
        return Result.success(friends);
    }

}
