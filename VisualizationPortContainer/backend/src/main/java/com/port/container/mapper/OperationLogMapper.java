package com.port.container.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.port.container.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
