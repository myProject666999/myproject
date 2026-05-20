package com.travel.service;

import com.travel.entity.DailySchedule;
import com.travel.repository.DailyScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class DailyScheduleService {

    @Autowired
    private DailyScheduleRepository dailyScheduleRepository;

    public List<DailySchedule> findByTripId(Long tripId) {
        return dailyScheduleRepository.findByTripIdOrderByDayNumber(tripId);
    }

    public Optional<DailySchedule> findById(Long id) {
        return dailyScheduleRepository.findById(id);
    }

    public DailySchedule save(DailySchedule dailySchedule) {
        return dailyScheduleRepository.save(dailySchedule);
    }

    public void deleteById(Long id) {
        dailyScheduleRepository.deleteById(id);
    }
}
