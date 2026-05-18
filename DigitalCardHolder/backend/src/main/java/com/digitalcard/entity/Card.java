package com.digitalcard.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("card")
public class Card {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long userId;
    private Long groupId;
    private String name;
    private String title;
    private String company;
    private String department;
    private String mobile;
    private String phone;
    private String email;
    private String website;
    private String address;
    private String fax;
    private String wechat;
    private String qq;
    private String remark;
    private String frontImage;
    private String backImage;
    private Boolean isFavorite;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
