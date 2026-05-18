package com.birthdayreminder.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("contact")
public class Contact {
    @TableId(type = IdType.AUTO)
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
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
