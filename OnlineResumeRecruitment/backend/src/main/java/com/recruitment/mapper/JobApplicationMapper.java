package com.recruitment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.recruitment.entity.JobApplication;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface JobApplicationMapper extends BaseMapper<JobApplication> {
}
