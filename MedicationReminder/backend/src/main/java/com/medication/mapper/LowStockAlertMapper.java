package com.medication.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.medication.entity.LowStockAlert;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface LowStockAlertMapper extends BaseMapper<LowStockAlert> {
}
