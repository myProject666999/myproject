package com.meeting.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.meeting.dto.ReservationCancelDTO;
import com.meeting.dto.ReservationCreateDTO;
import com.meeting.dto.ReservationQueryDTO;
import com.meeting.dto.PageResult;
import com.meeting.entity.Reservation;

import java.util.List;

public interface ReservationService extends IService<Reservation> {

    boolean createReservation(ReservationCreateDTO dto, Long userId);

    boolean cancelReservation(ReservationCancelDTO dto, Long userId);

    PageResult<Reservation> getReservationPage(Integer pageNum, Integer pageSize, ReservationQueryDTO query);

    List<Reservation> getMyReservations(Long userId);

    List<Reservation> getRoomReservations(Long roomId);

    boolean checkAvailability(Long roomId, String startTime, String endTime);
}
