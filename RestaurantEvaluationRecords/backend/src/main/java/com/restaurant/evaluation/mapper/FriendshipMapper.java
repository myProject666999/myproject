package com.restaurant.evaluation.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.restaurant.evaluation.entity.Friendship;
import com.restaurant.evaluation.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface FriendshipMapper extends BaseMapper<Friendship> {

    @Select("SELECT u.id, u.username, u.nickname, u.avatar " +
            "FROM friendship f " +
            "LEFT JOIN user u ON f.friend_id = u.id " +
            "WHERE f.user_id = #{userId} AND f.status = 1")
    List<UserVO> selectFriends(@Param("userId") Long userId);

}
