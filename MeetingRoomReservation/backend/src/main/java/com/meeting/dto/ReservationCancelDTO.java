package com.meeting.dto;

import lombok.Data;

@Data
public class ReservationCancelDTO {

    private Long id;

    private String cancelReason;
}
