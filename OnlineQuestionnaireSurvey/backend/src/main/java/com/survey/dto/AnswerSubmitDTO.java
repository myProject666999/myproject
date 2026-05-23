package com.survey.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.util.List;

@Data
public class AnswerSubmitDTO {
    @NotNull(message = "问卷ID不能为空")
    private Long surveyId;

    private String deviceId;

    private List<AnswerItemDTO> answers;

    @Data
    public static class AnswerItemDTO {
        @NotNull(message = "题目ID不能为空")
        private Long questionId;

        private String questionType;

        private Object answerContent;
    }
}
