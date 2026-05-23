package com.survey.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.entity.SurveyQuestion;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface SurveyQuestionMapper extends BaseMapper<SurveyQuestion> {
}