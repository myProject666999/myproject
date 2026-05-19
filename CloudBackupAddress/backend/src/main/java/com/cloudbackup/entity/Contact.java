package com.cloudbackup.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Date;

@Data
@TableName("contact")
public class Contact {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long addressBookId;

    private String uid;

    private String vcardUid;

    private String formattedName;

    private String firstName;

    private String lastName;

    private String middleName;

    private String nickname;

    private String title;

    private String organization;

    private String department;

    private String emails;

    private String phones;

    private String addresses;

    private String urls;

    private Date birthday;

    private String note;

    private String photo;

    private String vcardData;

    private String hashCode;

    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdTime;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedTime;

    @TableLogic
    private Integer deleted;
}
