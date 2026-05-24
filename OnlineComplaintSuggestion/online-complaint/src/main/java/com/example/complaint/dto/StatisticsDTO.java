package com.example.complaint.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
public class StatisticsDTO {

    private Long totalCount = 0L;
    private Long pendingCount = 0L;
    private Long processingCount = 0L;
    private Long completedCount = 0L;
    private Double avgRating = 0.0;
    private List<CategoryStat> categoryStats = new ArrayList<>();
    private List<AreaStat> areaStats = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStat {
        private String categoryName;
        private Long count;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AreaStat {
        private String area;
        private Long count;
    }
}
