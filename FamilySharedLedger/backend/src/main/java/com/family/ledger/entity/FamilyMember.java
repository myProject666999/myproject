package com.family.ledger.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@TableName("family_member")
public class FamilyMember {
    private Long id;
    private Long familyId;
    private Long userId;
    private Integer role;
    private LocalDateTime joinTime;
    private Integer status;
}
