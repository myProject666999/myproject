package com.dental.clinic.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dental.clinic.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
