package com.port.container.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.port.container.entity.Task;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface TaskMapper extends BaseMapper<Task> {
}
