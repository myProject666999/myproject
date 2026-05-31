package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.AuditLog;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AuditLogMapper extends BaseMapper<AuditLog> {

    List<AuditLog> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    List<AuditLog> selectByTarget(@Param("targetTable") String targetTable, @Param("targetId") Long targetId);
}
