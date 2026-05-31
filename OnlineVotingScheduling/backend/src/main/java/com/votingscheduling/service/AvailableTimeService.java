package com.votingscheduling.service;

import com.votingscheduling.entity.AvailableTime;
import com.votingscheduling.repository.AvailableTimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AvailableTimeService {

    private final AvailableTimeRepository availableTimeRepository;

    public List<AvailableTime> findByTeamAndUser(Long teamId, Long userId) {
        return availableTimeRepository.findByTeamIdAndUserId(teamId, userId);
    }

    public List<AvailableTime> findByTeam(Long teamId) {
        return availableTimeRepository.findByTeamId(teamId);
    }

    public List<AvailableTime> findByTeamAndWeekDay(Long teamId, Integer weekDay) {
        return availableTimeRepository.findByTeamIdAndWeekDay(teamId, weekDay);
    }

    @Transactional
    public List<AvailableTime> saveAll(Long teamId, Long userId, List<AvailableTime> times) {
        availableTimeRepository.deleteByTeamIdAndUserId(teamId, userId);
        if (times != null) {
            for (AvailableTime time : times) {
                time.setTeamId(teamId);
                time.setUserId(userId);
                time.setId(null);
            }
            return availableTimeRepository.saveAll(times);
        }
        return Collections.emptyList();
    }

    @Transactional
    public AvailableTime save(AvailableTime availableTime) {
        return availableTimeRepository.save(availableTime);
    }

    @Transactional
    public void delete(Long id) {
        availableTimeRepository.deleteById(id);
    }
}
