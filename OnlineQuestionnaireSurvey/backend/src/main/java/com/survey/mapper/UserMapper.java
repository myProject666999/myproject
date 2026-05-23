package com.survey.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}