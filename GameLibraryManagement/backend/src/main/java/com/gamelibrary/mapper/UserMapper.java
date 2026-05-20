package com.gamelibrary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gamelibrary.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
