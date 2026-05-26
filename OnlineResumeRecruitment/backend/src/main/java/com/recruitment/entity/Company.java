package com.recruitment.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.IdType;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("company")
public class Company {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long hrId;

    private String name;

    private String industry;

    private String scale;

    private String province;

    private String city;

    private String address;

    private String logo;

    private String description;

    private String website;

    private Integer verified;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private Integer deleted;
}
