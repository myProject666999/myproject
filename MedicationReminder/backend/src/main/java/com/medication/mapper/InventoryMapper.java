package com.medication.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.medication.entity.Inventory;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface InventoryMapper extends BaseMapper<Inventory> {
}
