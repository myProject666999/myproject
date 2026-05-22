package com.fitness.service;

import com.fitness.dto.QuestionnaireDTO;
import com.fitness.entity.Questionnaire;
import com.fitness.vo.WeeklyPlanVO;

public interface QuestionnaireService {
    Questionnaire save(QuestionnaireDTO dto);
    Questionnaire getByUserId(Long userId);
    WeeklyPlanVO generateWeeklyPlan(Long questionnaireId);
}
