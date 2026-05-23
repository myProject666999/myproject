package com.survey.service;

import com.survey.dto.QuestionDTO;
import com.survey.dto.QuestionVO;

import java.util.List;

public interface QuestionService {

    List<QuestionVO> getBySurveyId(Long surveyId);

    void saveQuestions(Long surveyId, List<QuestionDTO> questions);

    void deleteQuestion(Long id, Long surveyId);
}
