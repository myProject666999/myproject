package com.survey.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.survey.dto.SurveyCreateDTO;
import com.survey.dto.SurveyPublishDTO;
import com.survey.dto.SurveyUpdateDTO;
import com.survey.dto.SurveyVO;
import com.survey.entity.Survey;

public interface SurveyService {

    Survey create(SurveyCreateDTO dto, Long userId);

    Survey update(SurveyUpdateDTO dto, Long userId);

    void delete(Long id, Long userId);

    Survey getById(Long id);

    IPage<SurveyVO> list(Long userId, Integer status, int current, int size);

    Survey publish(SurveyPublishDTO dto, Long userId);

    Survey getPublishedById(Long id);

    void incrementViewCount(Long id);
}
