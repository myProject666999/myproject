package com.recycling.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.recycling.entity.UserWallet;
import com.recycling.entity.WalletTransaction;

import java.math.BigDecimal;
import java.util.List;

public interface WalletService extends IService<UserWallet> {
    UserWallet getUserWallet(Long userId);
    UserWallet initWallet(Long userId);
    void addIncome(Long userId, BigDecimal amount, Long relatedOrderId, String remark);
    void withdraw(Long userId, BigDecimal amount);
    List<WalletTransaction> getTransactions(Long userId, String type);
}
