package com.smartdoor.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.smartdoor.entity.Apartment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ApartmentMapper extends BaseMapper<Apartment> {
}
