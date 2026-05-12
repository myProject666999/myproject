package com.tcm.system.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("herb_conflict")
public class HerbConflict {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long herbAId;
    private String herbAName;
    private Long herbBId;
    private String herbBName;
    private Integer conflictType;
    private String description;
    private LocalDateTime createTime;
}
