package com.market.stall.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AnnouncementDTO {

    @NotNull
    private Long eventId;

    @NotBlank
    private String title;

    @NotBlank
    private String content;

    private Integer type;

    private Integer isTop;
}
