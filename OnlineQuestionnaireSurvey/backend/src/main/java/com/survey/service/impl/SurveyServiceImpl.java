package com.survey.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.survey.common.BusinessException;
import com.survey.common.ErrorCode;
import com.survey.dto.SurveyCreateDTO;
import com.survey.dto.SurveyPublishDTO;
import com.survey.dto.SurveyUpdateDTO;
import com.survey.dto.SurveyVO;
import com.survey.entity.Survey;
import com.survey.entity.User;
import com.survey.mapper.SurveyMapper;
import com.survey.mapper.SurveyQuestionMapper;
import com.survey.mapper.UserMapper;
import com.survey.service.SurveyService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SurveyServiceImpl implements SurveyService {

    private final SurveyMapper surveyMapper;
    private final SurveyQuestionMapper surveyQuestionMapper;
    private final UserMapper userMapper;

    @Override
    public Survey create(SurveyCreateDTO dto, Long userId) {
        Survey survey = new Survey();
        BeanUtils.copyProperties(dto, survey);
        survey.setUserId(userId);
        survey.setStatus(0);
        survey.setResponseCount(0);
        survey.setViewCount(0);
        surveyMapper.insert(survey);
        return survey;
    }

    @Override
    public Survey update(SurveyUpdateDTO dto, Long userId) {
        Survey survey = surveyMapper.selectById(dto.getId());
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }
        if (!survey.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (dto.getTitle() != null) {
            survey.setTitle(dto.getTitle());
        }
        if (dto.getDescription() != null) {
            survey.setDescription(dto.getDescription());
        }
        if (dto.getCoverImage() != null) {
            survey.setCoverImage(dto.getCoverImage());
        }
        if (dto.getStartTime() != null) {
            survey.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            survey.setEndTime(dto.getEndTime());
        }
        if (dto.getIsAnonymous() != null) {
            survey.setIsAnonymous(dto.getIsAnonymous());
        }
        if (dto.getMaxResponses() != null) {
            survey.setMaxResponses(dto.getMaxResponses());
        }

        surveyMapper.updateById(survey);
        return survey;
    }

    @Override
    public void delete(Long id, Long userId) {
        Survey survey = surveyMapper.selectById(id);
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }
        if (!survey.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        surveyMapper.deleteById(id);
    }

    @Override
    public Survey getById(Long id) {
        Survey survey = surveyMapper.selectById(id);
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }
        return survey;
    }

    @Override
    public IPage<SurveyVO> list(Long userId, Integer status, int current, int size) {
        Page<Survey> page = new Page<>(current, size);
        IPage<Survey> surveyPage = surveyMapper.selectSurveyPage(page, userId, status);

        return surveyPage.convert(survey -> {
            SurveyVO vo = new SurveyVO();
            BeanUtils.copyProperties(survey, vo);

            User user = userMapper.selectById(survey.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
            }

            LambdaQueryWrapper<com.survey.entity.SurveyQuestion> qWrapper = new LambdaQueryWrapper<>();
            qWrapper.eq(com.survey.entity.SurveyQuestion::getSurveyId, survey.getId());
            Long questionCount = surveyQuestionMapper.selectCount(qWrapper);
            vo.setQuestionCount(questionCount != null ? questionCount.intValue() : 0);

            return vo;
        });
    }

    @Override
    public Survey publish(SurveyPublishDTO dto, Long userId) {
        Survey survey = surveyMapper.selectById(dto.getSurveyId());
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }
        if (!survey.getUserId().equals(userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        survey.setStatus(dto.getStatus() != null ? dto.getStatus() : 1);
        if (dto.getStartTime() != null) {
            survey.setStartTime(dto.getStartTime());
        }
        if (dto.getEndTime() != null) {
            survey.setEndTime(dto.getEndTime());
        }
        if (dto.getMaxResponses() != null) {
            survey.setMaxResponses(dto.getMaxResponses());
        }
        surveyMapper.updateById(survey);
        return survey;
    }

    @Override
    public Survey getPublishedById(Long id) {
        Survey survey = surveyMapper.selectById(id);
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }

        if (survey.getStatus() == null || survey.getStatus() != 1) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_PUBLISHED);
        }

        if (survey.getEndTime() != null && survey.getEndTime().isBefore(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.SURVEY_EXPIRED);
        }

        if (survey.getMaxResponses() != null && survey.getMaxResponses() > 0
                && survey.getResponseCount() != null
                && survey.getResponseCount() >= survey.getMaxResponses()) {
            throw new BusinessException(ErrorCode.SURVEY_FULL);
        }

        incrementViewCount(id);
        return survey;
    }

    @Override
    public void incrementViewCount(Long id) {
        LambdaUpdateWrapper<Survey> wrapper = new LambdaUpdateWrapper<>();
        wrapper.eq(Survey::getId, id)
                .setSql("view_count = view_count + 1");
        surveyMapper.update(null, wrapper);
    }
}
