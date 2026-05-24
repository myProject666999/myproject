package com.logistics.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logistics.entity.TrackingNode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import java.util.List;

@Mapper
public interface TrackingNodeMapper extends BaseMapper<TrackingNode> {

    @Select("SELECT * FROM t_tracking_node WHERE waybill_no = #{waybillNo} ORDER BY node_time ASC")
    List<TrackingNode> selectByWaybillNo(@Param("waybillNo") String waybillNo);

    @Select("SELECT * FROM t_tracking_node WHERE waybill_id = #{waybillId} ORDER BY node_time ASC")
    List<TrackingNode> selectByWaybillId(@Param("waybillId") Long waybillId);
}
