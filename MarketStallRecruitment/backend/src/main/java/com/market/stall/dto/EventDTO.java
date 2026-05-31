package com.market.stall.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EventDTO {

    @NotBlank
    private String title;

    private String description;

    private String coverImage;

    @NotBlank
    private String address;

    @NotNull
    private LocalDateTime startTime;

    @NotNull
    private LocalDateTime endTime;

    @NotNull
    private LocalDateTime registrationStart;

    @NotNull
    private LocalDateTime registrationEnd;

    private String mapConfig;

    private String contactPhone;

    private String organizer;
}
