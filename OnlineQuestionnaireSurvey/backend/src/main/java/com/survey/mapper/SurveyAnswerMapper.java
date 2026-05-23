package com.survey.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.entity.SurveyAnswer;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface SurveyAnswerMapper extends BaseMapper<SurveyAnswer> {

    List<Map<String, Object>> selectAnswersBySurveyId(@Param("surveyId") Long surveyId);

    List<Map<String, Object>> selectAnswerStatistics(@Param("surveyId") Long surveyId);
}