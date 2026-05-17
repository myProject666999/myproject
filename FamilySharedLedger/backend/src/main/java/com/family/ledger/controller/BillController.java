package com.family.ledger.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.family.ledger.common.Result;
import com.family.ledger.entity.*;
import com.family.ledger.mapper.*;
import com.family.ledger.util.UserContext;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/bills")
public class BillController {

    @Autowired
    private BillMapper billMapper;

    @Autowired
    private BillSplitMapper billSplitMapper;

    @Autowired
    private FamilyMemberMapper familyMemberMapper;

    @Autowired
    private UserBalanceMapper userBalanceMapper;

    @GetMapping("/family/{familyId}")
    public Result<List<Bill>> getFamilyBills(@PathVariable Long familyId) {
        List<Bill> bills = billMapper.selectList(
                new QueryWrapper<Bill>()
                        .eq("family_id", familyId)
                        .eq("status", 1)
                        .orderByDesc("bill_date")
        );
        return Result.success(bills);
    }

    @GetMapping("/{id}")
    public Result<Bill> getBillDetail(@PathVariable Long id) {
        Bill bill = billMapper.selectById(id);
        if (bill == null) {
            return Result.error("账单不存在");
        }
        return Result.success(bill);
    }

    @PostMapping
    @Transactional
    public Result<Bill> createBill(@RequestBody BillRequest request) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        List<FamilyMember> members = familyMemberMapper.selectByFamilyId(request.getFamilyId());
        if (members.isEmpty()) {
            return Result.error("家庭不存在或无成员");
        }

        Bill bill = new Bill();
        bill.setTitle(request.getTitle());
        bill.setAmount(request.getAmount());
        bill.setCategory(request.getCategory());
        bill.setFamilyId(request.getFamilyId());
        bill.setPayerId(request.getPayerId());
        bill.setSplitType(request.getSplitType());
        bill.setBillDate(request.getBillDate());
        bill.setRemark(request.getRemark());
        bill.setStatus(1);
        bill.setCreateTime(LocalDateTime.now());
        bill.setUpdateTime(LocalDateTime.now());
        billMapper.insert(bill);

        int memberCount = members.size();
        BigDecimal shareAmount = request.getAmount().divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);
        BigDecimal ratio = BigDecimal.ONE.divide(BigDecimal.valueOf(memberCount), 4, RoundingMode.HALF_UP);

        for (FamilyMember member : members) {
            BillSplit split = new BillSplit();
            split.setBillId(bill.getId());
            split.setUserId(member.getUserId());
            split.setAmount(shareAmount);
            split.setRatio(ratio);
            split.setIsSettled(0);
            split.setCreateTime(LocalDateTime.now());
            billSplitMapper.insert(split);
        }

        updateUserBalance(request.getFamilyId(), request.getPayerId(), request.getAmount(), shareAmount);

        return Result.success(bill);
    }

    @PutMapping("/{id}")
    @Transactional
    public Result<Bill> updateBill(@PathVariable Long id, @RequestBody BillRequest request) {
        Bill bill = billMapper.selectById(id);
        if (bill == null) {
            return Result.error("账单不存在");
        }

        bill.setTitle(request.getTitle());
        bill.setAmount(request.getAmount());
        bill.setCategory(request.getCategory());
        bill.setPayerId(request.getPayerId());
        bill.setSplitType(request.getSplitType());
        bill.setBillDate(request.getBillDate());
        bill.setRemark(request.getRemark());
        bill.setUpdateTime(LocalDateTime.now());
        billMapper.updateById(bill);

        billSplitMapper.delete(new QueryWrapper<BillSplit>().eq("bill_id", id));

        List<FamilyMember> members = familyMemberMapper.selectByFamilyId(bill.getFamilyId());
        int memberCount = members.size();
        BigDecimal shareAmount = request.getAmount().divide(BigDecimal.valueOf(memberCount), 2, RoundingMode.HALF_UP);
        BigDecimal ratio = BigDecimal.ONE.divide(BigDecimal.valueOf(memberCount), 4, RoundingMode.HALF_UP);

        for (FamilyMember member : members) {
            BillSplit split = new BillSplit();
            split.setBillId(id);
            split.setUserId(member.getUserId());
            split.setAmount(shareAmount);
            split.setRatio(ratio);
            split.setIsSettled(0);
            split.setCreateTime(LocalDateTime.now());
            billSplitMapper.insert(split);
        }

        return Result.success(bill);
    }

    @DeleteMapping("/{id}")
    public Result<Void> deleteBill(@PathVariable Long id) {
        Bill bill = billMapper.selectById(id);
        if (bill == null) {
            return Result.error("账单不存在");
        }
        bill.setStatus(0);
        bill.setUpdateTime(LocalDateTime.now());
        billMapper.updateById(bill);
        return Result.success();
    }

    private void updateUserBalance(Long familyId, Long payerId, BigDecimal paidAmount, BigDecimal shareAmount) {
        List<FamilyMember> members = familyMemberMapper.selectByFamilyId(familyId);
        for (FamilyMember member : members) {
            UserBalance balance = userBalanceMapper.selectByFamilyIdAndUserId(familyId, member.getUserId());
            if (balance == null) {
                balance = new UserBalance();
                balance.setFamilyId(familyId);
                balance.setUserId(member.getUserId());
                balance.setTotalPaid(BigDecimal.ZERO);
                balance.setTotalShare(BigDecimal.ZERO);
                balance.setBalance(BigDecimal.ZERO);
                balance.setUpdateTime(LocalDateTime.now());
                userBalanceMapper.insert(balance);
            }

            if (member.getUserId().equals(payerId)) {
                balance.setTotalPaid(balance.getTotalPaid().add(paidAmount));
            }
            balance.setTotalShare(balance.getTotalShare().add(shareAmount));
            balance.setBalance(balance.getTotalPaid().subtract(balance.getTotalShare()));
            balance.setUpdateTime(LocalDateTime.now());
            userBalanceMapper.updateById(balance);
        }
    }

    @Data
    public static class BillRequest {
        private String title;
        private BigDecimal amount;
        private String category;
        private Long familyId;
        private Long payerId;
        private Integer splitType;
        private LocalDate billDate;
        private String remark;
    }
}
