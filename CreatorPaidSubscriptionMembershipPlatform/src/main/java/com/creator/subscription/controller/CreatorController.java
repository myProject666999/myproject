package com.creator.subscription.controller;

import com.creator.subscription.common.Result;
import com.creator.subscription.entity.Creator;
import com.creator.subscription.entity.MembershipTier;
import com.creator.subscription.service.CreatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/creators")
@RequiredArgsConstructor
public class CreatorController {

    private final CreatorService creatorService;

    @PostMapping("/register")
    public Result<Creator> registerCreator(@RequestBody Map<String, Object> request) {
        Long userId = Long.valueOf(request.get("userId").toString());
        String creatorName = (String) request.get("creatorName");
        String description = (String) request.get("description");
        return Result.success(creatorService.registerCreator(userId, creatorName, description));
    }

    @GetMapping("/{creatorId}")
    public Result<Creator> getCreatorById(@PathVariable Long creatorId) {
        return creatorService.getCreatorById(creatorId)
                .map(Result::success)
                .orElse(Result.error("创作者不存在"));
    }

    @GetMapping("/user/{userId}")
    public Result<Creator> getCreatorByUserId(@PathVariable Long userId) {
        return creatorService.getCreatorByUserId(userId)
                .map(Result::success)
                .orElse(Result.error("用户不是创作者"));
    }

    @GetMapping("/search")
    public Result<List<Creator>> searchCreators(@RequestParam String keyword) {
        return Result.success(creatorService.searchCreators(keyword));
    }

    @GetMapping("/top")
    public Result<List<Creator>> getTopCreators() {
        return Result.success(creatorService.getTopCreators());
    }

    @PutMapping("/{creatorId}")
    public Result<Creator> updateCreator(@PathVariable Long creatorId, @RequestBody Creator creator) {
        return Result.success(creatorService.updateCreator(creatorId, creator));
    }

    @GetMapping("/{creatorId}/tiers")
    public Result<List<MembershipTier>> getCreatorTiers(@PathVariable Long creatorId) {
        return Result.success(creatorService.getCreatorTiers(creatorId));
    }

    @GetMapping("/{creatorId}/tiers/all")
    public Result<List<MembershipTier>> getAllCreatorTiers(@PathVariable Long creatorId) {
        return Result.success(creatorService.getAllCreatorTiers(creatorId));
    }

    @PostMapping("/{creatorId}/tiers")
    public Result<MembershipTier> createTier(@PathVariable Long creatorId, @RequestBody MembershipTier tier) {
        tier.setCreatorId(creatorId);
        return Result.success(creatorService.createTier(tier));
    }

    @PutMapping("/tiers/{tierId}")
    public Result<MembershipTier> updateTier(@PathVariable Long tierId, @RequestBody MembershipTier tier) {
        return Result.success(creatorService.updateTier(tierId, tier));
    }

    @DeleteMapping("/tiers/{tierId}")
    public Result<Void> deleteTier(@PathVariable Long tierId) {
        creatorService.deleteTier(tierId);
        return Result.success();
    }
}
