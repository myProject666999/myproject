package com.diary.dto;

import lombok.Data;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class DiaryDTO {
    private Long id;

    @NotBlank(message = "标题不能为空")
    private String title;

    @NotBlank(message = "内容不能为空")
    private String content;

    @NotNull(message = "情绪评分不能为空")
    private Integer moodScore;

    @NotNull(message = "日记日期不能为空")
    private LocalDate diaryDate;

    private Long userId = 1L;
}
