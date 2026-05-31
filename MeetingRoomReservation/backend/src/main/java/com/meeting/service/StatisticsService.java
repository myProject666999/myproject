package com.meeting.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface StatisticsService {

    List<Map<String, Object>> getRoomUsage(LocalDate startDate, LocalDate endDate);

    Map<String, Object> getOverview(LocalDate startDate, LocalDate endDate);

    List<Map<String, Object>> getTrend(LocalDate startDate, LocalDate endDate);
}
