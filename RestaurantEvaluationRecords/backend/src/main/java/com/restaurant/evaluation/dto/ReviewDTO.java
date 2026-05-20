package com.restaurant.evaluation.dto;

import lombok.Data;

import javax.validation.constraints.Max;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class ReviewDTO {

    @NotNull(message = "餐厅ID不能为空")
    private Long restaurantId;

    @NotNull(message = "口味评分不能为空")
    @Min(value = 1, message = "口味评分最小为1")
    @Max(value = 5, message = "口味评分最大为5")
    private Integer tasteScore;

    @NotNull(message = "环境评分不能为空")
    @Min(value = 1, message = "环境评分最小为1")
    @Max(value = 5, message = "环境评分最大为5")
    private Integer environmentScore;

    @NotNull(message = "服务评分不能为空")
    @Min(value = 1, message = "服务评分最小为1")
    @Max(value = 5, message = "服务评分最大为5")
    private Integer serviceScore;

    @NotNull(message = "复购意愿不能为空")
    @Min(value = 1, message = "复购意愿最小为1")
    @Max(value = 3, message = "复购意愿最大为3")
    private Integer repurchaseIntention;

    private String content;

    private LocalDate visitDate;

}
