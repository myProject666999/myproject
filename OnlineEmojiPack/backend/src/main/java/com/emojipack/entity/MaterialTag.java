package com.emojipack.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("material_tag")
public class MaterialTag {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long materialId;

    private Long tagId;

    private LocalDateTime createTime;
}
