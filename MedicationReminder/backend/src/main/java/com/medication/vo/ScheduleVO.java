package com.medication.vo;

import lombok.Data;
import java.time.LocalDate;

@Data
public class ScheduleVO {
    private Long id;
    private Long userId;
    private String userName;
    private Long medicineId;
    private String medicineName;
    private String specification;
    private String dosage;
    private String frequencyType;
    private String frequencyDesc;
    private String weekDays;
    private String timeSlots;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer status;
    private String remark;
}
