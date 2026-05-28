package com.creator.subscription.controller;

import com.creator.subscription.common.Result;
import com.creator.subscription.dto.SubscribeRequest;
import com.creator.subscription.entity.Subscription;
import com.creator.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @PostMapping
    public Result<Subscription> subscribe(@RequestBody SubscribeRequest request) {
        return Result.success(subscriptionService.createSubscription(request));
    }

    @PostMapping("/payment/success")
    public Result<Void> paymentSuccess(@RequestBody Map<String, String> request) {
        String orderNo = request.get("orderNo");
        subscriptionService.processPaymentSuccess(orderNo);
        return Result.success();
    }

    @PostMapping("/{subscriptionId}/cancel")
    public Result<Void> cancelSubscription(@PathVariable Long subscriptionId,
                                           @RequestParam(defaultValue = "false") boolean immediate) {
        subscriptionService.cancelSubscription(subscriptionId, immediate);
        return Result.success();
    }

    @PostMapping("/{subscriptionId}/renew")
    public Result<Void> renewSubscription(@PathVariable Long subscriptionId) {
        subscriptionService.renewSubscription(subscriptionId);
        return Result.success();
    }

    @GetMapping("/user/{userId}")
    public Result<List<Subscription>> getUserSubscriptions(@PathVariable Long userId) {
        return Result.success(subscriptionService.getUserSubscriptions(userId));
    }

    @GetMapping("/user/{userId}/creator/{creatorId}")
    public Result<Subscription> getUserActiveSubscription(@PathVariable Long userId,
                                                           @PathVariable Long creatorId) {
        Optional<Subscription> subscription = subscriptionService.getUserActiveSubscription(userId, creatorId);
        return subscription.map(Result::success).orElse(Result.error("没有活跃订阅"));
    }

    @GetMapping("/user/{userId}/creator/{creatorId}/tier-level")
    public Result<Integer> getUserMaxTierLevel(@PathVariable Long userId,
                                                @PathVariable Long creatorId) {
        Integer tierLevel = subscriptionService.getUserMaxTierLevel(userId, creatorId);
        return Result.success(tierLevel != null ? tierLevel : 0);
    }
}
