package com.subscription.controller;

import com.subscription.entity.Reminder;
import com.subscription.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    @GetMapping("/pending")
    public ResponseEntity<List<Reminder>> getPendingReminders() {
        return ResponseEntity.ok(reminderService.getAllPendingReminders());
    }

    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<List<Reminder>> getRemindersBySubscriptionId(@PathVariable Long subscriptionId) {
        return ResponseEntity.ok(reminderService.getRemindersBySubscriptionId(subscriptionId));
    }

    @PostMapping
    public ResponseEntity<Reminder> createReminder(@RequestBody Reminder reminder) {
        return ResponseEntity.ok(reminderService.createReminder(reminder));
    }

    @PutMapping("/{id}/sent")
    public ResponseEntity<Reminder> markAsSent(@PathVariable Long id) {
        Optional<Reminder> reminder = reminderService.markAsSent(id);
        return reminder.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id) {
        reminderService.deleteReminder(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/generate")
    public ResponseEntity<Void> generateReminders() {
        reminderService.generateReminders();
        return ResponseEntity.ok().build();
    }
}
