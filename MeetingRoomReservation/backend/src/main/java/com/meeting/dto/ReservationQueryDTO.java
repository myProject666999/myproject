package com.meeting.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ReservationQueryDTO {

    private Long roomId;

    private Long userId;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer status;
}
