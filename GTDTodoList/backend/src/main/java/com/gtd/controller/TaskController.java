package com.gtd.controller;

import com.gtd.entity.Task;
import com.gtd.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3000")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getActiveTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getActiveTasks(userId));
    }

    @GetMapping("/user/{userId}/today")
    public ResponseEntity<List<Task>> getTodayTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getTodayTasks(userId));
    }

    @GetMapping("/user/{userId}/overdue")
    public ResponseEntity<List<Task>> getOverdueTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getOverdueTasks(userId));
    }

    @GetMapping("/user/{userId}/project/{projectId}")
    public ResponseEntity<List<Task>> getTasksByProject(@PathVariable Long userId, @PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(userId, projectId));
    }

    @GetMapping("/user/{userId}/completed")
    public ResponseEntity<List<Task>> getCompletedTasks(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getCompletedTasks(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        return taskService.getTaskById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody Task task) {
        return ResponseEntity.ok(taskService.createTask(task));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task task) {
        task.setId(id);
        return ResponseEntity.ok(taskService.updateTask(task));
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleComplete(@PathVariable Long id) {
        Task task = taskService.toggleComplete(id);
        return task != null ? ResponseEntity.ok(task) : ResponseEntity.notFound().build();
    }

    @PutMapping("/sort")
    public ResponseEntity<Void> updateSortOrder(@RequestBody Map<String, List<Long>> body) {
        List<Long> taskIds = body.get("taskIds");
        taskService.updateSortOrder(taskIds);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.ok().build();
    }
}
