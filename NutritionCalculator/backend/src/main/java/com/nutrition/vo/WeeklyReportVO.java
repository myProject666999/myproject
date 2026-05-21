package com.nutrition.vo;

import lombok.Data;
import java.util.List;

@Data
public class WeeklyReportVO {

    private String startDate;
    private String endDate;

    private Integer avgCalories;
    private Integer avgProtein;
    private Integer avgFat;
    private Integer avgCarbs;

    private List<DailySummaryVO> dailySummaries;

    private GoalCompareVO goalCompare;
}
