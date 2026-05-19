package com.timestatistics.service;

import com.timestatistics.entity.Goal;
import com.timestatistics.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    public List<Goal> getAllGoals() {
        return goalRepository.findByIsActive(1);
    }

    public List<Goal> getGoalsByType(String goalType) {
        return goalRepository.findByGoalTypeAndIsActive(goalType, 1);
    }

    public Goal createGoal(Goal goal) {
        return goalRepository.save(goal);
    }

    public Goal updateGoal(Long id, Goal goal) {
        goal.setId(id);
        return goalRepository.save(goal);
    }

    public void deleteGoal(Long id) {
        goalRepository.deleteById(id);
    }
}
