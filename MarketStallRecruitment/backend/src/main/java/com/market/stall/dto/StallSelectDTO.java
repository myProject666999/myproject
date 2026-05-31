package com.market.stall.dto;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StallSelectDTO {

    @NotNull
    private Long eventId;

    @NotNull
    private Long stallId;
}
