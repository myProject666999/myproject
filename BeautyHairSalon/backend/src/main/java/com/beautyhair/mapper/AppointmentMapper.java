
package com.beautyhair.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.beautyhair.entity.Appointment;
import org.apache.ibatis.annotations.Select;

import java.time.LocalDate;

public interface AppointmentMapper extends BaseMapper<Appointment> {

    @Select("SELECT COUNT(*) FROM appointment WHERE DATE(appointment_date) = #{date}")
    Long countByDate(LocalDate date);

    @Select("SELECT COUNT(*) FROM appointment WHERE DATE(appointment_date) = #{date} AND status = 4")
    Long countCompletedByDate(LocalDate date);
}
