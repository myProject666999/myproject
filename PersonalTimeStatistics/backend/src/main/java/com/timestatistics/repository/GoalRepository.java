package com.timestatistics.repository;

import com.timestatistics.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByIsActive(Integer isActive);

    List<Goal> findByGoalTypeAndIsActive(String goalType, Integer isActive);
}
