package com.corporate.reimbursement.service;

import java.util.List;
import java.util.Map;

public interface StatisticsService {

    Map<String, Object> getPersonalStats(Long userId);

    Map<String, Object> getDepartmentStats(Long deptId);

    List<Map<String, Object>> getMonthlyStats(int year);
}