package com.market.stall.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.market.stall.entity.Stall;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StallMapper extends BaseMapper<Stall> {

    List<Stall> selectByEventId(@Param("eventId") Long eventId);
}
