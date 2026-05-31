package com.meeting.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.meeting.dto.ReservationQueryDTO;
import com.meeting.entity.Reservation;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationMapper extends BaseMapper<Reservation> {

    @Select("SELECT * FROM reservation WHERE room_id = #{roomId} AND status IN (1, 2) AND is_deleted = 0 " +
            "AND ((start_time < #{endTime}) AND (end_time > #{startTime}))")
    List<Reservation> findConflictingReservations(@Param("roomId") Long roomId,
                                                   @Param("startTime") LocalDateTime startTime,
                                                   @Param("endTime") LocalDateTime endTime);

    IPage<Reservation> selectReservationPage(Page<Reservation> page, @Param("query") ReservationQueryDTO query);

    @Select("SELECT r.*, m.name as room_name, m.code as room_code, m.location as room_location, " +
            "u.real_name as user_name " +
            "FROM reservation r " +
            "LEFT JOIN meeting_room m ON r.room_id = m.id " +
            "LEFT JOIN user u ON r.user_id = u.id " +
            "WHERE r.user_id = #{userId} AND r.is_deleted = 0 " +
            "ORDER BY r.start_time DESC")
    List<Reservation> findByUserIdWithDetail(@Param("userId") Long userId);
}
