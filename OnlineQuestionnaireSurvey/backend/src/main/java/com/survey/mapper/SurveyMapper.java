package com.survey.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.survey.entity.Survey;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SurveyMapper extends BaseMapper<Survey> {

    IPage<Survey> selectSurveyPage(IPage<Survey> page,
                                   @Param("userId") Long userId,
                                   @Param("status") Integer status);
}