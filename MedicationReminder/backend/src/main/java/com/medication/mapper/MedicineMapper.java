package com.medication.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.medication.entity.Medicine;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MedicineMapper extends BaseMapper<Medicine> {
}
