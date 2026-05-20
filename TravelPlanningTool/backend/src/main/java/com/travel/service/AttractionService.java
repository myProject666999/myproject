package com.travel.service;

import com.travel.entity.Attraction;
import com.travel.repository.AttractionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AttractionService {

    @Autowired
    private AttractionRepository attractionRepository;

    public List<Attraction> findByDailyScheduleId(Long dailyScheduleId) {
        return attractionRepository.findByDailyScheduleIdOrderBySortOrder(dailyScheduleId);
    }

    public Optional<Attraction> findById(Long id) {
        return attractionRepository.findById(id);
    }

    public Attraction save(Attraction attraction) {
        return attractionRepository.save(attraction);
    }

    public void deleteById(Long id) {
        attractionRepository.deleteById(id);
    }
}
