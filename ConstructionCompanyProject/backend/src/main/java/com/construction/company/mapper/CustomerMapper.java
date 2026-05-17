package com.construction.company.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.construction.company.entity.Customer;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CustomerMapper extends BaseMapper<Customer> {
}
