package com.fishing.reservation.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.fishing.reservation.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
