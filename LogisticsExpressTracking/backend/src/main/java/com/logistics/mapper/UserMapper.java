package com.logistics.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logistics.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface UserMapper extends BaseMapper<User> {

    @Select("SELECT * FROM t_user WHERE username = #{username} AND password = #{password}")
    User selectByUsernameAndPassword(@Param("username") String username, @Param("password") String password);
}
