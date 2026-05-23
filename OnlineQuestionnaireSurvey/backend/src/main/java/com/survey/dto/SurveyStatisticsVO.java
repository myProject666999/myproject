package com.survey.dto;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class SurveyStatisticsVO {
    private Long surveyId;

    private Integer totalResponses;

    private List<QuestionStat> questionStats;

    @Data
    public static class QuestionStat {
        private Long questionId;

        private String questionTitle;

        private String questionType;

        private Map<String, Integer> answerCounts;

        private Map<String, Double> percentages;

        private Object chartData;
    }
}
