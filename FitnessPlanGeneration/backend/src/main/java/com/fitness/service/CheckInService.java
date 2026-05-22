package com.fitness.service;

import com.fitness.dto.CheckInDTO;
import com.fitness.entity.CheckInRecord;
import com.fitness.entity.AdjustmentSuggestion;
import com.fitness.vo.DailyPlanVO;
import java.time.LocalDate;
import java.util.List;

public interface CheckInService {
    CheckInRecord checkIn(CheckInDTO dto);
    List<CheckInRecord> getByUserId(Long userId);
    CheckInRecord getByDailyPlanId(Long dailyPlanId);
    List<AdjustmentSuggestion> generateSuggestions(Long userId, Long dailyPlanId);
}
