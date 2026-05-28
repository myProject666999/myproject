package com.creator.subscription.controller;

import com.creator.subscription.common.Result;
import com.creator.subscription.dto.CreatorEarningsDTO;
import com.creator.subscription.dto.WithdrawRequest;
import com.creator.subscription.entity.EarningDetail;
import com.creator.subscription.entity.WithdrawalRecord;
import com.creator.subscription.service.EarningService;
import com.creator.subscription.service.WithdrawalService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/earnings")
@RequiredArgsConstructor
public class EarningController {

    private final EarningService earningService;
    private final WithdrawalService withdrawalService;

    @GetMapping("/creator/{creatorId}")
    public Result<CreatorEarningsDTO> getCreatorEarnings(@PathVariable Long creatorId) {
        return Result.success(earningService.getCreatorEarnings(creatorId));
    }

    @GetMapping("/creator/{creatorId}/details")
    public Result<Page<EarningDetail>> getEarningDetails(@PathVariable Long creatorId,
                                                          @RequestParam(defaultValue = "0") int page,
                                                          @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return Result.success(earningService.getEarningDetails(creatorId, pageable));
    }

    @GetMapping("/creator/{creatorId}/pending")
    public Result<List<EarningDetail>> getPendingEarnings(@PathVariable Long creatorId) {
        return Result.success(earningService.getPendingEarnings(creatorId));
    }

    @GetMapping("/creator/{creatorId}/settled")
    public Result<List<EarningDetail>> getSettledEarnings(@PathVariable Long creatorId) {
        return Result.success(earningService.getSettledEarnings(creatorId));
    }

    @PostMapping("/settlement/process")
    public Result<Void> processSettlement() {
        earningService.processSettlement();
        return Result.success();
    }

    @PostMapping("/withdraw")
    public Result<WithdrawalRecord> createWithdrawal(@RequestBody WithdrawRequest request) {
        return Result.success(withdrawalService.createWithdrawal(request));
    }

    @GetMapping("/withdraw/{withdrawalId}")
    public Result<WithdrawalRecord> getWithdrawalRecord(@PathVariable Long withdrawalId) {
        return withdrawalService.getWithdrawalRecord(withdrawalId)
                .map(Result::success)
                .orElse(Result.error("提现记录不存在"));
    }

    @GetMapping("/withdraw/creator/{creatorId}")
    public Result<Page<WithdrawalRecord>> getCreatorWithdrawals(@PathVariable Long creatorId,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return Result.success(withdrawalService.getCreatorWithdrawals(creatorId, pageable));
    }

    @PostMapping("/withdraw/{withdrawalId}/process")
    public Result<Void> processWithdrawal(@PathVariable Long withdrawalId) {
        withdrawalService.processWithdrawal(withdrawalId);
        return Result.success();
    }

    @PostMapping("/withdraw/{withdrawalId}/complete")
    public Result<Void> completeWithdrawal(@PathVariable Long withdrawalId) {
        withdrawalService.completeWithdrawal(withdrawalId);
        return Result.success();
    }

    @PostMapping("/withdraw/{withdrawalId}/fail")
    public Result<Void> failWithdrawal(@PathVariable Long withdrawalId,
                                        @RequestBody Map<String, String> request) {
        String remark = request.get("remark");
        withdrawalService.failWithdrawal(withdrawalId, remark);
        return Result.success();
    }

    @GetMapping("/withdraw/pending")
    public Result<List<WithdrawalRecord>> getPendingWithdrawals() {
        return Result.success(withdrawalService.getPendingWithdrawals());
    }
}
