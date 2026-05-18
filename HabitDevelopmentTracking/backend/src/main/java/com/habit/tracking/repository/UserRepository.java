package com.habit.tracking.repository;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.habit.tracking.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserRepository extends BaseMapper<User> {
}
