package com.birthdayreminder.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ContactDTO {
    private Long id;
    private Long userId;
    private String name;
    private Integer gender;
    private String phone;
    private String email;
    private LocalDate birthday;
    private Integer calendarType;
    private Integer lunarMonth;
    private Integer lunarDay;
    private Integer isLeap;
    private String relation;
    private String remark;
}
