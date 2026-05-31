package com.smartdoor.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartdoor.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper extends BaseMapper<OperationLog> {
}
