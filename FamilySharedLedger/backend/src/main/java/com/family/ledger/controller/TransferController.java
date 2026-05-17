package com.family.ledger.controller;

import com.family.ledger.common.Result;
import com.family.ledger.entity.Transfer;
import com.family.ledger.entity.User;
import com.family.ledger.entity.UserBalance;
import com.family.ledger.mapper.TransferMapper;
import com.family.ledger.mapper.UserBalanceMapper;
import com.family.ledger.mapper.UserMapper;
import com.family.ledger.util.UserContext;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transfer")
public class TransferController {

    @Autowired
    private TransferMapper transferMapper;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private UserBalanceMapper userBalanceMapper;

    @GetMapping("/my")
    public Result<Map<String, Object>> getMyTransfers() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        List<Transfer> transfers = transferMapper.selectByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        BigDecimal totalOwe = BigDecimal.ZERO;
        BigDecimal totalOwed = BigDecimal.ZERO;
        List<Map<String, Object>> oweList = new ArrayList<>();
        List<Map<String, Object>> owedList = new ArrayList<>();

        for (Transfer t : transfers) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", t.getId());
            item.put("settleId", t.getSettleId());
            item.put("fromUserId", t.getFromUserId());
            item.put("toUserId", t.getToUserId());
            item.put("amount", t.getAmount());
            item.put("status", t.getStatus());
            item.put("transferTime", t.getTransferTime());
            item.put("remark", t.getRemark());
            item.put("createTime", t.getCreateTime());

            User fromUser = userMapper.selectById(t.getFromUserId());
            User toUser = userMapper.selectById(t.getToUserId());
            if (fromUser != null) item.put("fromUserName", fromUser.getNickname());
            if (toUser != null) item.put("toUserName", toUser.getNickname());

            if (t.getStatus() == 0) {
                if (t.getFromUserId().equals(userId)) {
                    totalOwe = totalOwe.add(t.getAmount());
                    oweList.add(item);
                } else if (t.getToUserId().equals(userId)) {
                    totalOwed = totalOwed.add(t.getAmount());
                    owedList.add(item);
                }
            }

            result.add(item);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("totalOwe", totalOwe);
        data.put("totalOwed", totalOwed);
        data.put("oweList", oweList);
        data.put("owedList", owedList);
        data.put("history", result);

        return Result.success(data);
    }

    @PostMapping("/{id}/pay")
    public Result<Transfer> markAsPaid(@PathVariable Long id, @RequestBody(required = false) PayRequest request) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        Transfer transfer = transferMapper.selectById(id);
        if (transfer == null) {
            return Result.error("转账记录不存在");
        }

        if (!transfer.getFromUserId().equals(userId)) {
            return Result.error("只有付款人可以标记为已转账");
        }

        transfer.setStatus(1);
        transfer.setTransferTime(LocalDateTime.now());
        if (request != null) {
            transfer.setRemark(request.getRemark());
        }
        transferMapper.updateById(transfer);

        return Result.success(transfer);
    }

    @PostMapping("/{id}/confirm")
    public Result<Transfer> confirmReceived(@PathVariable Long id) {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        Transfer transfer = transferMapper.selectById(id);
        if (transfer == null) {
            return Result.error("转账记录不存在");
        }

        if (!transfer.getToUserId().equals(userId)) {
            return Result.error("只有收款人可以确认收款");
        }

        transfer.setStatus(2);
        transferMapper.updateById(transfer);

        return Result.success(transfer);
    }

    @GetMapping("/balance")
    public Result<List<Map<String, Object>>> getMyBalances() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            return Result.error(401, "未登录");
        }

        List<UserBalance> balances = userBalanceMapper.selectByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();

        for (UserBalance b : balances) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", b.getId());
            item.put("familyId", b.getFamilyId());
            item.put("totalPaid", b.getTotalPaid());
            item.put("totalShare", b.getTotalShare());
            item.put("balance", b.getBalance());
            item.put("updateTime", b.getUpdateTime());
            result.add(item);
        }

        return Result.success(result);
    }

    @Data
    public static class PayRequest {
        private String remark;
    }
}
