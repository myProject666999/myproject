package com.birthdayreminder.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.birthdayreminder.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
