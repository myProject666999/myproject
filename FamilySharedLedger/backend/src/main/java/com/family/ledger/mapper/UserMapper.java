package com.family.ledger.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.family.ledger.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
