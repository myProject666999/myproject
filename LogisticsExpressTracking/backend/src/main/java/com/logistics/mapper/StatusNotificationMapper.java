package com.logistics.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.logistics.entity.StatusNotification;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;
import java.util.List;

@Mapper
public interface StatusNotificationMapper extends BaseMapper<StatusNotification> {

    @Select("SELECT * FROM t_status_notification WHERE waybill_no = #{waybillNo} ORDER BY create_time DESC")
    List<StatusNotification> selectByWaybillNo(@Param("waybillNo") String waybillNo);

    @Update("UPDATE t_status_notification SET is_read = 1 WHERE id = #{id}")
    int markAsRead(@Param("id") Long id);
}
