package com.survey.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.survey.common.BusinessException;
import com.survey.common.ErrorCode;
import com.survey.dto.QuestionDTO;
import com.survey.dto.QuestionVO;
import com.survey.entity.Survey;
import com.survey.entity.SurveyQuestion;
import com.survey.mapper.SurveyMapper;
import com.survey.mapper.SurveyQuestionMapper;
import com.survey.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final SurveyQuestionMapper surveyQuestionMapper;
    private final SurveyMapper surveyMapper;
    private final ObjectMapper objectMapper;

    @Override
    public List<QuestionVO> getBySurveyId(Long surveyId) {
        LambdaQueryWrapper<SurveyQuestion> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SurveyQuestion::getSurveyId, surveyId)
                .orderByAsc(SurveyQuestion::getSortOrder);

        List<SurveyQuestion> questions = surveyQuestionMapper.selectList(wrapper);
        List<QuestionVO> result = new ArrayList<>();

        for (SurveyQuestion q : questions) {
            QuestionVO vo = new QuestionVO();
            BeanUtils.copyProperties(q, vo);

            if (q.getConfig() != null) {
                try {
                    vo.setConfig(objectMapper.readValue(q.getConfig(), Object.class));
                } catch (JsonProcessingException e) {
                    vo.setConfig(q.getConfig());
                }
            }

            if (q.getLogicConfig() != null) {
                try {
                    vo.setLogicConfig(objectMapper.readValue(q.getLogicConfig(), Object.class));
                } catch (JsonProcessingException e) {
                    vo.setLogicConfig(q.getLogicConfig());
                }
            }

            result.add(vo);
        }

        return result;
    }

    @Override
    @Transactional
    public void saveQuestions(Long surveyId, List<QuestionDTO> questions) {
        Survey survey = surveyMapper.selectById(surveyId);
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }

        LambdaQueryWrapper<SurveyQuestion> deleteWrapper = new LambdaQueryWrapper<>();
        deleteWrapper.eq(SurveyQuestion::getSurveyId, surveyId);
        surveyQuestionMapper.delete(deleteWrapper);

        int sortOrder = 1;
        for (QuestionDTO dto : questions) {
            SurveyQuestion question = new SurveyQuestion();
            question.setSurveyId(surveyId);
            question.setQuestionType(dto.getQuestionType());
            question.setTitle(dto.getTitle());
            question.setDescription(dto.getDescription());
            question.setRequired(dto.getRequired() != null ? dto.getRequired() : 1);
            question.setSortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : sortOrder);

            if (dto.getConfig() != null) {
                try {
                    question.setConfig(objectMapper.writeValueAsString(dto.getConfig()));
                } catch (JsonProcessingException e) {
                    question.setConfig(dto.getConfig().toString());
                }
            }

            if (dto.getLogicConfig() != null) {
                try {
                    question.setLogicConfig(objectMapper.writeValueAsString(dto.getLogicConfig()));
                } catch (JsonProcessingException e) {
                    question.setLogicConfig(dto.getLogicConfig().toString());
                }
            }

            surveyQuestionMapper.insert(question);
            sortOrder++;
        }
    }

    @Override
    public void deleteQuestion(Long id, Long surveyId) {
        Survey survey = surveyMapper.selectById(surveyId);
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }

        SurveyQuestion question = surveyQuestionMapper.selectById(id);
        if (question == null || !question.getSurveyId().equals(surveyId)) {
            throw new BusinessException(ErrorCode.BAD_REQUEST.getCode(), "题目不存在");
        }

        surveyQuestionMapper.deleteById(id);
    }
}
