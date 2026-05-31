package com.insurance.controller;

import com.insurance.entity.Reminder;
import com.insurance.service.ReminderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
@CrossOrigin(origins = "http://localhost:3000")
public class ReminderController {
    @Autowired
    private ReminderService reminderService;

    @GetMapping
    public ResponseEntity<List<Reminder>> getAllReminders() {
        return ResponseEntity.ok(reminderService.getAllReminders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Reminder> getReminderById(@PathVariable Long id) {
        return reminderService.getReminderById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Reminder>> getRemindersByStatus(@PathVariable String status) {
        return ResponseEntity.ok(reminderService.getRemindersByStatus(status));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Reminder>> getRemindersByType(@PathVariable String type) {
        return ResponseEntity.ok(reminderService.getRemindersByType(type));
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<Reminder>> getRemindersByPolicyId(@PathVariable Long policyId) {
        return ResponseEntity.ok(reminderService.getRemindersByPolicyId(policyId));
    }

    @GetMapping("/upcoming/{days}")
    public ResponseEntity<List<Reminder>> getUpcomingReminders(@PathVariable int days) {
        return ResponseEntity.ok(reminderService.getUpcomingReminders(days));
    }

    @PutMapping("/{id}/sent")
    public ResponseEntity<Reminder> markAsSent(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.markAsSent(id));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Reminder> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(reminderService.markAsRead(id));
    }

    @GetMapping("/count/pending")
    public ResponseEntity<Map<String, Long>> getPendingReminderCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("count", reminderService.getPendingReminderCount());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/trigger")
    public ResponseEntity<Void> triggerReminders() {
        reminderService.sendDueReminders();
        return ResponseEntity.ok().build();
    }
}
