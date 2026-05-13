package com.gym.membership.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gym.membership.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
