package com.emojipack.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("collection_material")
public class CollectionMaterial {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long collectionId;

    private Long materialId;

    private Integer sort;

    private LocalDateTime createTime;
}
