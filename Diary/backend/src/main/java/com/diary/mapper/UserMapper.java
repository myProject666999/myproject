package com.diary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.diary.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
