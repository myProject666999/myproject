package com.workorder.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.workorder.entity.TicketLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TicketLogMapper extends BaseMapper<TicketLog> {
}