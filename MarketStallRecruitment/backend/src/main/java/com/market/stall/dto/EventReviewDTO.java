package com.market.stall.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class EventReviewDTO {

    @NotNull
    private Long eventId;
}
