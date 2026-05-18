package com.gtd.repository;

import com.gtd.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserIdAndCompletedFalseOrderBySortOrderAscCreatedAtDesc(Long userId);
    
    List<Task> findByUserIdAndDueDateAndCompletedFalseOrderBySortOrderAscCreatedAtDesc(Long userId, LocalDate dueDate);
    
    List<Task> findByUserIdAndProjectIdAndCompletedFalseOrderBySortOrderAscCreatedAtDesc(Long userId, Long projectId);
    
    List<Task> findByUserIdAndCompletedTrueOrderByCompletedAtDesc(Long userId);
    
    @Query("SELECT t FROM Task t WHERE t.userId = :userId AND t.dueDate <= :today AND t.completed = false ORDER BY t.sortOrder ASC, t.createdAt DESC")
    List<Task> findOverdueTasks(@Param("userId") Long userId, @Param("today") LocalDate today);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.userId = :userId AND t.completed = true AND t.completedAt BETWEEN :start AND :end")
    Integer countCompletedTasksInRange(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT COUNT(t) FROM Task t WHERE t.userId = :userId AND t.createdAt BETWEEN :start AND :end")
    Integer countCreatedTasksInRange(@Param("userId") Long userId, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
