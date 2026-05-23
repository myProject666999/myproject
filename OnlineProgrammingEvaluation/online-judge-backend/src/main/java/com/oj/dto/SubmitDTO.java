package com.oj.dto;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class SubmitDTO {
    @NotNull(message = "题目ID不能为空")
    private Long problemId;
    private Long contestId;
    @NotNull(message = "语言不能为空")
    private String language;
    @NotNull(message = "代码不能为空")
    private String code;
}
