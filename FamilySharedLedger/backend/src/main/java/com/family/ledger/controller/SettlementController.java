package com.family.ledger.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.family.ledger.common.Result;
import com.family.ledger.entity.*;
import com.family.ledger.mapper.*;
import com.family.ledger.util.SettlementUtil;
import com.family.ledger.util.UserContext;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/settlement")
public class SettlementController {

    @Autowired
    private SettlementMapper settlementMapper;

    @Autowired
    private TransferMapper transferMapper;

    @Autowired
    private BillMapper billMapper;

    @Autowired
    private BillSplitMapper billSplitMapper;

    @Autowired
    private UserBalanceMapper userBalanceMapper;

    @Autowired
    private FamilyMemberMapper familyMemberMapper;

    @Autowired
    private UserMapper userMapper;

    @GetMapping("/family/{familyId}")
    public Result<List<Settlement>> getSettlements(@PathVariable Long familyId) {
        List<Settlement> settlements = settlementMapper.selectByFamilyId(familyId);
        return Result.success(settlements);
    }

    @GetMapping("/{id}")
    public Result<Map<String, Object>> getSettlementDetail(@PathVariable Long id) {
        Settlement settlement = settlementMapper.selectById(id);
        if (settlement == null) {
            return Result.error("结算记录不存在");
        }

        Map<String, Object> result = new HashMap<>();
        result.put("settlement", settlement);

        List<Transfer> transfers = transferMapper.selectBySettleId(id);
        List<Map<String, Object>> transferList = new ArrayList<>();
        for (Transfer t : transfers) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", t.getId());
            item.put("fromUserId", t.getFromUserId());
            item.put("toUserId", t.getToUserId());
            item.put("amount", t.getAmount());
            item.put("status", t.getStatus());
            item.put("transferTime", t.getTransferTime());
            item.put("remark", t.getRemark());

            User fromUser = userMapper.selectById(t.getFromUserId());
            User toUser = userMapper.selectById(t.getToUserId());
            if (fromUser != null) item.put("fromUserName", fromUser.getNickname());
            if (toUser != null) item.put("toUserName", toUser.getNickname());

            transferList.add(item);
        }
        result.put("transfers", transferList);

        return Result.success(result);
    }

    @PostMapping("/preview")
    public Result<Map<String, Object>> previewSettlement(@RequestBody CreateSettlementRequest request) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        List<Bill> bills = billMapper.selectByFamilyIdAndDateRange(
                request.getFamilyId(), request.getStartDate(), request.getEndDate()
        );

        Map<Long, BigDecimal> balances = new HashMap<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<FamilyMember> members = familyMemberMapper.selectByFamilyId(request.getFamilyId());
        for (FamilyMember member : members) {
            balances.put(member.getUserId(), BigDecimal.ZERO);
        }

        for (Bill bill : bills) {
            totalAmount = totalAmount.add(bill.getAmount());
            balances.put(bill.getPayerId(), balances.get(bill.getPayerId()).add(bill.getAmount()));

            List<BillSplit> splits = billSplitMapper.selectByBillId(bill.getId());
            for (BillSplit split : splits) {
                balances.put(split.getUserId(), balances.get(split.getUserId()).subtract(split.getAmount()));
            }
        }

        List<Map<String, Object>> balanceDetails = new ArrayList<>();
        for (Map.Entry<Long, BigDecimal> entry : balances.entrySet()) {
            User user = userMapper.selectById(entry.getKey());
            if (user != null) {
                Map<String, Object> detail = new HashMap<>();
                detail.put("userId", entry.getKey());
                detail.put("nickname", user.getNickname());
                detail.put("balance", entry.getValue());
                balanceDetails.add(detail);
            }
        }

        List<Transfer> transfers = SettlementUtil.calculateMinTransfers(balances, null);

        Map<String, Object> result = new HashMap<>();
        result.put("totalAmount", totalAmount);
        result.put("balanceDetails", balanceDetails);
        result.put("transfers", transfers);
        result.put("transferCount", transfers.size());

        return Result.success(result);
    }

    @PostMapping
    @Transactional
    public Result<Settlement> createSettlement(@RequestBody CreateSettlementRequest request) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        Settlement settlement = new Settlement();
        settlement.setFamilyId(request.getFamilyId());
        settlement.setTitle(request.getTitle());
        settlement.setStartDate(request.getStartDate());
        settlement.setEndDate(request.getEndDate());
        settlement.setTotalAmount(BigDecimal.ZERO);
        settlement.setStatus(0);
        settlement.setCreatorId(userId);
        settlement.setCreateTime(LocalDateTime.now());
        settlement.setUpdateTime(LocalDateTime.now());

        List<Bill> bills = billMapper.selectByFamilyIdAndDateRange(
                request.getFamilyId(), request.getStartDate(), request.getEndDate()
        );

        Map<Long, BigDecimal> balances = new HashMap<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<FamilyMember> members = familyMemberMapper.selectByFamilyId(request.getFamilyId());
        for (FamilyMember member : members) {
            balances.put(member.getUserId(), BigDecimal.ZERO);
        }

        for (Bill bill : bills) {
            totalAmount = totalAmount.add(bill.getAmount());
            balances.put(bill.getPayerId(), balances.get(bill.getPayerId()).add(bill.getAmount()));

            List<BillSplit> splits = billSplitMapper.selectByBillId(bill.getId());
            for (BillSplit split : splits) {
                balances.put(split.getUserId(), balances.get(split.getUserId()).subtract(split.getAmount()));
            }
        }

        settlement.setTotalAmount(totalAmount);
        settlementMapper.insert(settlement);

        List<Transfer> transfers = SettlementUtil.calculateMinTransfers(balances, settlement.getId());
        for (Transfer transfer : transfers) {
            transfer.setSettleId(settlement.getId());
            transferMapper.insert(transfer);
        }

        return Result.success(settlement);
    }

    @PostMapping("/{id}/confirm")
    public Result<Void> confirmSettlement(@PathVariable Long id) {
        Settlement settlement = settlementMapper.selectById(id);
        if (settlement == null) {
            return Result.error("结算记录不存在");
        }
        settlement.setStatus(1);
        settlement.setUpdateTime(LocalDateTime.now());
        settlementMapper.updateById(settlement);
        return Result.success();
    }

    @Data
    public static class CreateSettlementRequest {
        private Long familyId;
        private String title;
        private LocalDate startDate;
        private LocalDate endDate;
    }
}
