package com.db.schema.review.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.db.schema.review.entity.AuditLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AuditLogMapper extends BaseMapper<AuditLog> {
}
