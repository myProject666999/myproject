package com.birthdayreminder.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class BirthdayReminderDTO {
    private Long contactId;
    private String name;
    private LocalDate birthday;
    private Integer calendarType;
    private String relation;
    private Long daysUntil;
    private Integer age;
}
