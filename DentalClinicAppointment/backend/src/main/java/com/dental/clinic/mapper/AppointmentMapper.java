package com.dental.clinic.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.dental.clinic.entity.Appointment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface AppointmentMapper extends BaseMapper<Appointment> {
}
