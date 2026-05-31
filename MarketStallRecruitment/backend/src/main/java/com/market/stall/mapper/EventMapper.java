package com.market.stall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.market.stall.entity.Event;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface EventMapper extends BaseMapper<Event> {
}
