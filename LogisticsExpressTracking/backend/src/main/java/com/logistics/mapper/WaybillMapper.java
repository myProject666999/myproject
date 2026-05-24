package com.logistics.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logistics.entity.Waybill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface WaybillMapper extends BaseMapper<Waybill> {

    @Select("SELECT * FROM t_waybill WHERE waybill_no = #{waybillNo}")
    Waybill selectByWaybillNo(@Param("waybillNo") String waybillNo);
}
