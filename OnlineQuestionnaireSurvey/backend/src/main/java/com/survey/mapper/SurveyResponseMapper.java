package com.survey.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.survey.entity.SurveyResponse;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;

@Mapper
public interface SurveyResponseMapper extends BaseMapper<SurveyResponse> {

    Long countBySurveyId(@Param("surveyId") Long surveyId);

    Long countByIpAndTime(@Param("surveyId") Long surveyId,
                          @Param("ipAddress") String ipAddress,
                          @Param("time") LocalDateTime time);
}