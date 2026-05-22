package com.bmi.tracking.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.bmi.tracking.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
