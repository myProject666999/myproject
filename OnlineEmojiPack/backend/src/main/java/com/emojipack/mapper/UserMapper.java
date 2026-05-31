package com.emojipack.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.emojipack.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
