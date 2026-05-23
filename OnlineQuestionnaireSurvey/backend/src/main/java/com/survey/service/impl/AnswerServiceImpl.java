package com.survey.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.survey.common.BusinessException;
import com.survey.common.ErrorCode;
import com.survey.dto.AnswerSubmitDTO;
import com.survey.dto.SurveyStatisticsVO;
import com.survey.entity.Survey;
import com.survey.entity.SurveyAnswer;
import com.survey.entity.SurveyQuestion;
import com.survey.entity.SurveyResponse;
import com.survey.mapper.SurveyAnswerMapper;
import com.survey.mapper.SurveyMapper;
import com.survey.mapper.SurveyQuestionMapper;
import com.survey.mapper.SurveyResponseMapper;
import com.survey.service.AnswerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnswerServiceImpl implements AnswerService {

    private final SurveyResponseMapper surveyResponseMapper;
    private final SurveyAnswerMapper surveyAnswerMapper;
    private final SurveyMapper surveyMapper;
    private final SurveyQuestionMapper surveyQuestionMapper;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${survey.rate-limit.ip-window-seconds:60}")
    private Long ipWindowSeconds;

    @Value("${survey.rate-limit.ip-max-count:5}")
    private Long ipMaxCount;

    @Value("${survey.rate-limit.device-window-seconds:86400}")
    private Long deviceWindowSeconds;

    @Value("${survey.rate-limit.device-max-count:3}")
    private Long deviceMaxCount;

    @Value("${survey.cache.statistics-expire-seconds:300}")
    private Long statisticsExpireSeconds;

    @Override
    @Transactional
    public void submitAnswer(AnswerSubmitDTO dto, String ipAddress, String userAgent, Long userId) {
        Survey survey = surveyMapper.selectById(dto.getSurveyId());
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

        checkRateLimit(dto.getSurveyId(), ipAddress, dto.getDeviceId());

        LambdaQueryWrapper<SurveyQuestion> qWrapper = new LambdaQueryWrapper<>();
        qWrapper.eq(SurveyQuestion::getSurveyId, dto.getSurveyId())
                .orderByAsc(SurveyQuestion::getSortOrder);
        List<SurveyQuestion> questions = surveyQuestionMapper.selectList(qWrapper);

        validateAnswers(dto.getAnswers(), questions);

        SurveyResponse response = new SurveyResponse();
        response.setSurveyId(dto.getSurveyId());
        response.setUserId(userId);
        response.setIpAddress(ipAddress);
        response.setUserAgent(userAgent);
        response.setDeviceId(dto.getDeviceId());
        response.setSubmitTime(LocalDateTime.now());
        response.setStatus(1);
        surveyResponseMapper.insert(response);

        for (AnswerSubmitDTO.AnswerItemDTO item : dto.getAnswers()) {
            SurveyAnswer answer = new SurveyAnswer();
            answer.setResponseId(response.getId());
            answer.setSurveyId(dto.getSurveyId());
            answer.setQuestionId(item.getQuestionId());
            answer.setQuestionType(item.getQuestionType());

            if (item.getAnswerContent() != null) {
                try {
                    answer.setAnswerContent(objectMapper.writeValueAsString(item.getAnswerContent()));
                } catch (JsonProcessingException e) {
                    answer.setAnswerContent(item.getAnswerContent().toString());
                }
                answer.setAnswerText(extractAnswerText(item.getAnswerContent()));
            }

            surveyAnswerMapper.insert(answer);
        }

        LambdaUpdateWrapper<Survey> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(Survey::getId, dto.getSurveyId())
                .setSql("response_count = response_count + 1");
        surveyMapper.update(null, updateWrapper);

        String cacheKey = "survey:statistics:" + dto.getSurveyId();
        redisTemplate.delete(cacheKey);
    }

    @Override
    public IPage<SurveyResponse> getResponses(Long surveyId, int current, int size) {
        LambdaQueryWrapper<SurveyResponse> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(SurveyResponse::getSurveyId, surveyId)
                .orderByDesc(SurveyResponse::getSubmitTime);
        return surveyResponseMapper.selectPage(new Page<>(current, size), wrapper);
    }

    @Override
    public SurveyStatisticsVO getStatistics(Long surveyId) {
        String cacheKey = "survey:statistics:" + surveyId;
        String cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            try {
                return objectMapper.readValue(cached, SurveyStatisticsVO.class);
            } catch (JsonProcessingException e) {
                log.warn("Failed to parse cached statistics", e);
            }
        }

        Survey survey = surveyMapper.selectById(surveyId);
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }

        SurveyStatisticsVO vo = new SurveyStatisticsVO();
        vo.setSurveyId(surveyId);
        vo.setTotalResponses(survey.getResponseCount() != null ? survey.getResponseCount() : 0);

        LambdaQueryWrapper<SurveyQuestion> qWrapper = new LambdaQueryWrapper<>();
        qWrapper.eq(SurveyQuestion::getSurveyId, surveyId)
                .orderByAsc(SurveyQuestion::getSortOrder);
        List<SurveyQuestion> questions = surveyQuestionMapper.selectList(qWrapper);

        List<Map<String, Object>> answerStats = surveyAnswerMapper.selectAnswerStatistics(surveyId);

        Map<Long, Map<String, Integer>> questionAnswerCounts = new HashMap<>();
        for (Map<String, Object> stat : answerStats) {
            Long questionId = ((Number) stat.get("question_id")).longValue();
            String answerContent = (String) stat.get("answer_content");
            Integer count = ((Number) stat.get("answer_count")).intValue();

            questionAnswerCounts.computeIfAbsent(questionId, k -> new LinkedHashMap<>())
                    .merge(answerContent, count, Integer::sum);
        }

        List<SurveyStatisticsVO.QuestionStat> questionStats = new ArrayList<>();
        int totalResponses = vo.getTotalResponses();

        for (SurveyQuestion q : questions) {
            SurveyStatisticsVO.QuestionStat stat = new SurveyStatisticsVO.QuestionStat();
            stat.setQuestionId(q.getId());
            stat.setQuestionTitle(q.getTitle());
            stat.setQuestionType(q.getQuestionType());

            Map<String, Integer> answerCounts = questionAnswerCounts.getOrDefault(q.getId(), new LinkedHashMap<>());
            stat.setAnswerCounts(answerCounts);

            Map<String, Double> percentages = new LinkedHashMap<>();
            if (totalResponses > 0) {
                for (Map.Entry<String, Integer> entry : answerCounts.entrySet()) {
                    percentages.put(entry.getKey(), (entry.getValue() * 100.0) / totalResponses);
                }
            }
            stat.setPercentages(percentages);

            stat.setChartData(buildChartData(q, answerCounts));
            questionStats.add(stat);
        }

        vo.setQuestionStats(questionStats);

        try {
            redisTemplate.opsForValue().set(cacheKey, objectMapper.writeValueAsString(vo),
                    statisticsExpireSeconds, TimeUnit.SECONDS);
        } catch (JsonProcessingException e) {
            log.warn("Failed to cache statistics", e);
        }

        return vo;
    }

    @Override
    public byte[] exportExcel(Long surveyId) {
        Survey survey = surveyMapper.selectById(surveyId);
        if (survey == null) {
            throw new BusinessException(ErrorCode.SURVEY_NOT_FOUND);
        }

        LambdaQueryWrapper<SurveyQuestion> qWrapper = new LambdaQueryWrapper<>();
        qWrapper.eq(SurveyQuestion::getSurveyId, surveyId)
                .orderByAsc(SurveyQuestion::getSortOrder);
        List<SurveyQuestion> questions = surveyQuestionMapper.selectList(qWrapper);

        LambdaQueryWrapper<SurveyResponse> rWrapper = new LambdaQueryWrapper<>();
        rWrapper.eq(SurveyResponse::getSurveyId, surveyId)
                .eq(SurveyResponse::getStatus, 1)
                .orderByAsc(SurveyResponse::getSubmitTime);
        List<SurveyResponse> responses = surveyResponseMapper.selectList(rWrapper);

        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            Sheet infoSheet = workbook.createSheet("问卷信息");
            int rowNum = 0;
            Row infoRow = infoSheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("问卷标题");
            infoRow.createCell(1).setCellValue(survey.getTitle() != null ? survey.getTitle() : "");

            infoRow = infoSheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("问卷描述");
            infoRow.createCell(1).setCellValue(survey.getDescription() != null ? survey.getDescription() : "");

            infoRow = infoSheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("创建时间");
            infoRow.createCell(1).setCellValue(survey.getCreateTime() != null ? survey.getCreateTime().toString() : "");

            infoRow = infoSheet.createRow(rowNum++);
            infoRow.createCell(0).setCellValue("填写数量");
            infoRow.createCell(1).setCellValue(survey.getResponseCount() != null ? survey.getResponseCount() : 0);

            Sheet dataSheet = workbook.createSheet("答卷数据");
            Row headerRow = dataSheet.createRow(0);
            headerRow.createCell(0).setCellValue("序号");
            headerRow.createCell(1).setCellValue("提交时间");
            headerRow.createCell(2).setCellValue("IP地址");

            int colNum = 3;
            for (SurveyQuestion q : questions) {
                headerRow.createCell(colNum++).setCellValue(q.getTitle());
            }
            for (int i = 0; i < colNum; i++) {
                headerRow.getCell(i).setCellStyle(headerStyle);
            }

            List<Map<String, Object>> allAnswers = surveyAnswerMapper.selectAnswersBySurveyId(surveyId);
            Map<Long, Map<String, String>> responseAnswerMap = new LinkedHashMap<>();
            for (Map<String, Object> a : allAnswers) {
                Long responseId = ((Number) a.get("response_id")).longValue();
                Long questionId = ((Number) a.get("question_id")).longValue();
                String answerContent = (String) a.get("answer_text");
                if (answerContent == null) {
                    answerContent = (String) a.get("answer_content");
                }
                responseAnswerMap.computeIfAbsent(responseId, k -> new HashMap<>())
                        .put(questionId.toString(), answerContent);
            }

            int rowIdx = 1;
            for (SurveyResponse response : responses) {
                Row row = dataSheet.createRow(rowIdx);
                row.createCell(0).setCellValue(rowIdx);
                row.createCell(1).setCellValue(response.getSubmitTime() != null ? response.getSubmitTime().toString() : "");
                row.createCell(2).setCellValue(response.getIpAddress() != null ? response.getIpAddress() : "");

                Map<String, String> answerMap = responseAnswerMap.getOrDefault(response.getId(), new HashMap<>());
                int qIdx = 3;
                for (SurveyQuestion q : questions) {
                    String answer = answerMap.get(q.getId().toString());
                    row.createCell(qIdx++).setCellValue(answer != null ? answer : "");
                }
                rowIdx++;
            }

            for (int i = 0; i < colNum; i++) {
                dataSheet.autoSizeColumn(i);
            }

            workbook.write(outputStream);
            return outputStream.toByteArray();

        } catch (Exception e) {
            log.error("导出Excel失败", e);
            throw new BusinessException("导出Excel失败: " + e.getMessage());
        }
    }

    private void checkRateLimit(Long surveyId, String ipAddress, String deviceId) {
        if (ipAddress != null) {
            String ipKey = "rate_limit:ip:" + surveyId + ":" + ipAddress;
            Long count = redisTemplate.opsForValue().increment(ipKey);
            if (count != null && count == 1) {
                redisTemplate.expire(ipKey, ipWindowSeconds, TimeUnit.SECONDS);
            }
            if (count != null && count > ipMaxCount) {
                throw new BusinessException(ErrorCode.RATE_LIMIT_IP);
            }
        }

        if (deviceId != null) {
            String deviceKey = "rate_limit:device:" + surveyId + ":" + deviceId;
            Long count = redisTemplate.opsForValue().increment(deviceKey);
            if (count != null && count == 1) {
                redisTemplate.expire(deviceKey, deviceWindowSeconds, TimeUnit.SECONDS);
            }
            if (count != null && count > deviceMaxCount) {
                throw new BusinessException(ErrorCode.RATE_LIMIT_DEVICE);
            }
        }
    }

    private void validateAnswers(List<AnswerSubmitDTO.AnswerItemDTO> answers, List<SurveyQuestion> questions) {
        if (answers == null || answers.isEmpty()) {
            return;
        }

        Map<Long, SurveyQuestion> questionMap = new HashMap<>();
        for (SurveyQuestion q : questions) {
            questionMap.put(q.getId(), q);
        }

        for (AnswerSubmitDTO.AnswerItemDTO item : answers) {
            SurveyQuestion q = questionMap.get(item.getQuestionId());
            if (q == null) {
                continue;
            }

            if (q.getRequired() != null && q.getRequired() == 1) {
                if (item.getAnswerContent() == null) {
                    throw new BusinessException(ErrorCode.ANSWER_REQUIRED.getCode(),
                            "题目\"" + q.getTitle() + "\"为必答项");
                }

                if (item.getAnswerContent() instanceof String s && s.trim().isEmpty()) {
                    throw new BusinessException(ErrorCode.ANSWER_REQUIRED.getCode(),
                            "题目\"" + q.getTitle() + "\"为必答项");
                }

                if (item.getAnswerContent() instanceof List<?> list && list.isEmpty()) {
                    throw new BusinessException(ErrorCode.ANSWER_REQUIRED.getCode(),
                            "题目\"" + q.getTitle() + "\"为必答项");
                }
            }
        }
    }

    private String extractAnswerText(Object answerContent) {
        if (answerContent == null) {
            return null;
        }
        if (answerContent instanceof String s) {
            return s;
        }
        if (answerContent instanceof List<?> list) {
            try {
                return objectMapper.writeValueAsString(list);
            } catch (JsonProcessingException e) {
                return list.toString();
            }
        }
        if (answerContent instanceof Map<?, ?> map) {
            try {
                return objectMapper.writeValueAsString(map);
            } catch (JsonProcessingException e) {
                return map.toString();
            }
        }
        return answerContent.toString();
    }

    private Object buildChartData(SurveyQuestion question, Map<String, Integer> answerCounts) {
        List<Map<String, Object>> chartData = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : answerCounts.entrySet()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", entry.getKey());
            item.put("value", entry.getValue());
            chartData.add(item);
        }

        return chartData;
    }
}
