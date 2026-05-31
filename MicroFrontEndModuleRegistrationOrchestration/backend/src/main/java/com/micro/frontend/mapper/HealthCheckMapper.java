package com.micro.frontend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.micro.frontend.dto.PageQueryDTO;
import com.micro.frontend.entity.HealthCheck;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface HealthCheckMapper extends BaseMapper<HealthCheck> {

    HealthCheck selectByAppId(@Param("appId") Long appId);

    List<HealthCheck> selectActiveChecks();

    List<HealthCheck> selectPageList(PageQueryDTO query);

    Long selectPageCount(PageQueryDTO query);

    Integer selectStatusCount(@Param("healthStatus") Integer healthStatus);

    int updateLastCheckResult(@Param("id") Long id, @Param("lastCheckTime") LocalDateTime lastCheckTime,
                               @Param("lastCheckResult") String lastCheckResult, @Param("lastResponseTime") Integer lastResponseTime);

    int incrementConsecutiveSuccess(@Param("id") Long id);

    int resetConsecutiveFail(@Param("id") Long id);

    int incrementConsecutiveFail(@Param("id") Long id);

    int resetConsecutiveSuccess(@Param("id") Long id);

    int updateHealthStatus(@Param("id") Long id, @Param("healthStatus") Integer healthStatus);

    int updateLastOfflineTime(@Param("id") Long id, @Param("lastOfflineTime") LocalDateTime lastOfflineTime);

    int updateStatus(@Param("id") Long id, @Param("status") Integer status);
}
