package com.survey.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.survey.dto.AnswerSubmitDTO;
import com.survey.dto.SurveyStatisticsVO;
import com.survey.entity.SurveyResponse;

public interface AnswerService {

    void submitAnswer(AnswerSubmitDTO dto, String ipAddress, String userAgent, Long userId);

    IPage<SurveyResponse> getResponses(Long surveyId, int current, int size);

    SurveyStatisticsVO getStatistics(Long surveyId);

    byte[] exportExcel(Long surveyId);
}
