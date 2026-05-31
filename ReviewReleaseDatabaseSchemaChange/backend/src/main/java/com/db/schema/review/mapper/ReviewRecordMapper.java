package com.db.schema.review.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.db.schema.review.entity.ReviewRecord;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ReviewRecordMapper extends BaseMapper<ReviewRecord> {
}
