package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.Account;
import com.cashflow.entity.AccountTransaction;
import com.cashflow.entity.Payable;
import com.cashflow.mapper.AccountMapper;
import com.cashflow.mapper.AccountTransactionMapper;
import com.cashflow.mapper.PayableMapper;
import com.cashflow.service.CurrencyService;
import com.cashflow.service.PayableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PayableServiceImpl extends ServiceImpl<PayableMapper, Payable> implements PayableService {

    @Autowired
    private AccountMapper accountMapper;

    @Autowired
    private AccountTransactionMapper transactionMapper;

    @Autowired
    private CurrencyService currencyService;

    @Override
    public IPage<Payable> pageList(int current, int size, String keyword, String status) {
        LambdaQueryWrapper<Payable> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Payable::getSupplierName, keyword);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Payable::getStatus, status);
        }
        wrapper.orderByDesc(Payable::getDueDate);
        return this.page(new Page<>(current, size), wrapper);
    }

    @Override
    public List<Payable> listByDueDateRange(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<Payable> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(Payable::getDueDate, startDate, endDate)
                .in(Payable::getStatus, "PENDING", "OVERDUE")
                .orderByAsc(Payable::getDueDate);
        return this.list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Payable addPayable(Payable payable) {
        if (payable.getPaidAmount() == null) {
            payable.setPaidAmount(0L);
        }
        if (payable.getStatus() == null) {
            payable.setStatus("PENDING");
        }
        if (payable.getCurrency() == null) {
            payable.setCurrency("CNY");
        }
        this.save(payable);
        return payable;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Payable updatePayable(Payable payable) {
        this.updateById(payable);
        return payable;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deletePayable(Long id) {
        this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmPayment(Long id, Long amount, Long accountId) {
        Payable payable = this.getById(id);
        if (payable == null) {
            throw new RuntimeException("应付款项不存在");
        }

        long newPaidAmount = payable.getPaidAmount() + amount;
        payable.setPaidAmount(newPaidAmount);

        if (newPaidAmount >= payable.getAmount()) {
            payable.setStatus("PAID");
        } else {
            payable.setStatus("PARTIAL");
        }
        this.updateById(payable);

        Account account = accountMapper.selectById(accountId);
        if (account == null) {
            throw new RuntimeException("账户不存在");
        }
        Long amountInAccountCurrency = currencyService.convert(amount, payable.getCurrency(), account.getCurrency());
        if (account.getBalance() < amountInAccountCurrency) {
            throw new RuntimeException("账户余额不足");
        }
        account.setBalance(account.getBalance() - amountInAccountCurrency);
        accountMapper.updateById(account);

        AccountTransaction transaction = new AccountTransaction();
        transaction.setAccountId(accountId);
        transaction.setType("OUT");
        transaction.setAmount(amount);
        transaction.setCurrency(payable.getCurrency());
        transaction.setDescription("应付款确认: " + payable.getSupplierName());
        transaction.setTransactionDate(LocalDate.now());
        transaction.setRelatedType("PAYABLE");
        transaction.setRelatedId(id);
        transactionMapper.insert(transaction);
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        List<Payable> all = this.list();
        long totalAmount = 0L;
        long totalPaid = 0L;
        long pendingCount = 0L;
        long overdueCount = 0L;
        long overdueAmount = 0L;

        LocalDate today = LocalDate.now();

        for (Payable p : all) {
            long amountCNY = currencyService.convertToCNY(p.getAmount(), p.getCurrency());
            long paidCNY = currencyService.convertToCNY(p.getPaidAmount(), p.getCurrency());
            totalAmount += amountCNY;
            totalPaid += paidCNY;

            if ("PENDING".equals(p.getStatus()) || "PARTIAL".equals(p.getStatus())) {
                if (p.getDueDate().isBefore(today)) {
                    overdueCount++;
                    overdueAmount += (amountCNY - paidCNY);
                } else {
                    pendingCount++;
                }
            }
        }

        stats.put("totalAmount", totalAmount);
        stats.put("totalPaid", totalPaid);
        stats.put("pendingAmount", totalAmount - totalPaid);
        stats.put("pendingCount", pendingCount);
        stats.put("overdueCount", overdueCount);
        stats.put("overdueAmount", overdueAmount);

        return stats;
    }
}
