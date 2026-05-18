package com.gtd.service;

import com.gtd.entity.Task;
import com.gtd.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getActiveTasks(Long userId) {
        return taskRepository.findByUserIdAndCompletedFalseOrderBySortOrderAscCreatedAtDesc(userId);
    }

    public List<Task> getTodayTasks(Long userId) {
        return taskRepository.findByUserIdAndDueDateAndCompletedFalseOrderBySortOrderAscCreatedAtDesc(userId, LocalDate.now());
    }

    public List<Task> getOverdueTasks(Long userId) {
        return taskRepository.findOverdueTasks(userId, LocalDate.now());
    }

    public List<Task> getTasksByProject(Long userId, Long projectId) {
        return taskRepository.findByUserIdAndProjectIdAndCompletedFalseOrderBySortOrderAscCreatedAtDesc(userId, projectId);
    }

    public List<Task> getCompletedTasks(Long userId) {
        return taskRepository.findByUserIdAndCompletedTrueOrderByCompletedAtDesc(userId);
    }

    public Optional<Task> getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(Task task) {
        return taskRepository.save(task);
    }

    @Transactional
    public Task toggleComplete(Long id) {
        return taskRepository.findById(id).map(task -> {
            task.setCompleted(!task.getCompleted());
            if (task.getCompleted()) {
                task.setCompletedAt(LocalDateTime.now());
            } else {
                task.setCompletedAt(null);
            }
            return taskRepository.save(task);
        }).orElse(null);
    }

    @Transactional
    public void updateSortOrder(List<Long> taskIds) {
        for (int i = 0; i < taskIds.size(); i++) {
            Long id = taskIds.get(i);
            final int sortOrder = i;
            taskRepository.findById(id).ifPresent(task -> {
                task.setSortOrder(sortOrder);
                taskRepository.save(task);
            });
        }
    }

    public void deleteTask(Long id) {
        taskRepository.deleteById(id);
    }

    public Integer countCompletedTasksInRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return taskRepository.countCompletedTasksInRange(userId, start, end);
    }

    public Integer countCreatedTasksInRange(Long userId, LocalDateTime start, LocalDateTime end) {
        return taskRepository.countCreatedTasksInRange(userId, start, end);
    }
}
