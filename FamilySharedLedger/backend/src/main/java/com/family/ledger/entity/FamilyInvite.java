package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("family_invite")
public class FamilyInvite {
    private Long id;
    private Long familyId;
    private Long inviterId;
    private String inviteeEmail;
    private String inviteeName;
    private Integer status;
    private LocalDateTime expireTime;
    private LocalDateTime createTime;
}
