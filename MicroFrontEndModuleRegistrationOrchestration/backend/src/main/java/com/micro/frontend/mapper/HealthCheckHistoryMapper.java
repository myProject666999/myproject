package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.HealthCheckHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface HealthCheckHistoryMapper extends BaseMapper<HealthCheckHistory> {

    List<HealthCheckHistory> selectByAppId(@Param("appId") Long appId);

    List<HealthCheckHistory> selectByAppIdWithLimit(@Param("appId") Long appId, @Param("limit") Integer limit);

    List<HealthCheckHistory> selectList(PageQueryDTO query);

    Long selectCount(PageQueryDTO query);

    List<Map<String, Object>> select24HourStats(@Param("appId") Long appId);

    int cleanOldHistory(@Param("days") Integer days);
}
