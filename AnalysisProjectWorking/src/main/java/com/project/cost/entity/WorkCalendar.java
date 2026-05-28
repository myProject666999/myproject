package com.project.cost.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDate;

@Data
@TableName("sys_work_calendar")
public class WorkCalendar {
    @TableId(type = IdType.AUTO)
    private Long calendarId;
    private LocalDate calendarDate;
    private Integer dateType;
    private Integer weekDay;
    private String holidayName;
}
