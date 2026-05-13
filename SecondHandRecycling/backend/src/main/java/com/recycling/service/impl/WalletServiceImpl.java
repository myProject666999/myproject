package com.recycling.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.recycling.entity.UserWallet;
import com.recycling.entity.WalletTransaction;
import com.recycling.exception.BusinessException;
import com.recycling.mapper.UserWalletMapper;
import com.recycling.mapper.WalletTransactionMapper;
import com.recycling.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
public class WalletServiceImpl extends ServiceImpl<UserWalletMapper, UserWallet> implements WalletService {

    @Autowired
    private WalletTransactionMapper transactionMapper;

    @Override
    public UserWallet getUserWallet(Long userId) {
        UserWallet wallet = getOne(new LambdaQueryWrapper<UserWallet>()
                .eq(UserWallet::getUserId, userId)
                .eq(UserWallet::getDeleted, 0));
        
        if (wallet == null) {
            wallet = initWallet(userId);
        }
        return wallet;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserWallet initWallet(Long userId) {
        UserWallet wallet = new UserWallet();
        wallet.setUserId(userId);
        wallet.setBalance(BigDecimal.ZERO);
        wallet.setFrozenAmount(BigDecimal.ZERO);
        wallet.setTotalIncome(BigDecimal.ZERO);
        wallet.setTotalWithdraw(BigDecimal.ZERO);
        save(wallet);
        return wallet;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void addIncome(Long userId, BigDecimal amount, Long relatedOrderId, String remark) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("金额必须大于0");
        }
        
        UserWallet wallet = getUserWallet(userId);
        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal balanceAfter = balanceBefore.add(amount);
        
        wallet.setBalance(balanceAfter);
        wallet.setTotalIncome(wallet.getTotalIncome().add(amount));
        updateById(wallet);
        
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionNo(generateTransactionNo());
        transaction.setUserId(userId);
        transaction.setType("INCOME");
        transaction.setAmount(amount);
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setRelatedOrderId(relatedOrderId);
        transaction.setRemark(remark);
        transactionMapper.insert(transaction);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void withdraw(Long userId, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("金额必须大于0");
        }
        
        UserWallet wallet = getUserWallet(userId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new BusinessException("余额不足");
        }
        
        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal balanceAfter = balanceBefore.subtract(amount);
        
        wallet.setBalance(balanceAfter);
        wallet.setTotalWithdraw(wallet.getTotalWithdraw().add(amount));
        updateById(wallet);
        
        WalletTransaction transaction = new WalletTransaction();
        transaction.setTransactionNo(generateTransactionNo());
        transaction.setUserId(userId);
        transaction.setType("WITHDRAW");
        transaction.setAmount(amount.negate());
        transaction.setBalanceBefore(balanceBefore);
        transaction.setBalanceAfter(balanceAfter);
        transaction.setRemark("提现");
        transactionMapper.insert(transaction);
    }

    @Override
    public List<WalletTransaction> getTransactions(Long userId, String type) {
        LambdaQueryWrapper<WalletTransaction> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(WalletTransaction::getUserId, userId)
                .eq(WalletTransaction::getDeleted, 0);
        if (type != null && !type.isEmpty()) {
            wrapper.eq(WalletTransaction::getType, type);
        }
        wrapper.orderByDesc(WalletTransaction::getCreateTime);
        return transactionMapper.selectList(wrapper);
    }

    private String generateTransactionNo() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String random = String.format("%06d", new Random().nextInt(1000000));
        return "TX" + dateStr + random;
    }
}
