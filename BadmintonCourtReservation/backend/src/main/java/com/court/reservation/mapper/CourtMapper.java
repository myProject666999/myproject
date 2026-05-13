package com.court.reservation.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.court.reservation.entity.Court;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CourtMapper extends BaseMapper<Court> {
}