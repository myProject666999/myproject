package com.gamelibrary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gamelibrary.entity.UserGame;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserGameMapper extends BaseMapper<UserGame> {
}
