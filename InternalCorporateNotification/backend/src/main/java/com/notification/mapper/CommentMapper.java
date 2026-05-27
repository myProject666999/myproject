package com.notification.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.notification.entity.Comment;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentMapper extends BaseMapper<Comment> {
}
