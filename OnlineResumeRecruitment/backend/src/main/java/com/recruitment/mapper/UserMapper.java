package com.recruitment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.recruitment.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT * FROM user WHERE username = #{username} AND deleted = 0")
    User selectByUsername(String username);
}
