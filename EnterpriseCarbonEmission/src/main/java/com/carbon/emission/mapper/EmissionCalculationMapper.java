package com.carbon.emission.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.carbon.emission.entity.EmissionCalculation;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface EmissionCalculationMapper extends BaseMapper<EmissionCalculation> {

    @Delete("DELETE FROM emission_calculation WHERE org_id = #{orgId} AND period_type = #{periodType} AND period_value = #{periodValue}")
    int physicalDeleteByPeriod(@Param("orgId") Long orgId, @Param("periodType") Integer periodType, @Param("periodValue") String periodValue);
}
