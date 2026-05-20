package com.gamelibrary.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.gamelibrary.entity.Game;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface GameMapper extends BaseMapper<Game> {
}
