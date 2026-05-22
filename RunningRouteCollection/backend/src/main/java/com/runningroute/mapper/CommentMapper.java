package com.runningroute.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.runningroute.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
