package com.oj.judge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JudgeResult {
    private Integer status;
    private Integer timeUsed;
    private Integer memoryUsed;
    private String errorMsg;
    private Integer passedCases;
    private Integer totalCases;
}
