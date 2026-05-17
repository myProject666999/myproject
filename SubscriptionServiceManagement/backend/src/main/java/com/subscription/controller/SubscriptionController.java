package com.subscription.controller;

import com.subscription.dto.SubscriptionDTO;
import com.subscription.entity.Subscription;
import com.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping
    public ResponseEntity<List<SubscriptionDTO>> getAllSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getAllSubscriptions());
    }

    @GetMapping("/active")
    public ResponseEntity<List<SubscriptionDTO>> getActiveSubscriptions() {
        return ResponseEntity.ok(subscriptionService.getActiveSubscriptions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionDTO> getSubscriptionById(@PathVariable Long id) {
        return subscriptionService.getSubscriptionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<SubscriptionDTO> createSubscription(@RequestBody Subscription subscription) {
        return ResponseEntity.ok(subscriptionService.createSubscription(subscription));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionDTO> updateSubscription(@PathVariable Long id, @RequestBody Subscription subscription) {
        return subscriptionService.updateSubscription(id, subscription)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable Long id) {
        if (subscriptionService.deleteSubscription(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/upcoming/{days}")
    public ResponseEntity<List<SubscriptionDTO>> getUpcomingRenewals(@PathVariable int days) {
        return ResponseEntity.ok(subscriptionService.getUpcomingRenewals(days));
    }

    @GetMapping("/reminders")
    public ResponseEntity<List<SubscriptionDTO>> getSubscriptionsNeedingReminder() {
        return ResponseEntity.ok(subscriptionService.getSubscriptionsNeedingReminder());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {
        return ResponseEntity.ok(subscriptionService.getCategories());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<SubscriptionDTO>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(subscriptionService.getByCategory(category));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<SubscriptionDTO> renewSubscription(@PathVariable Long id) {
        return subscriptionService.renewSubscription(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
