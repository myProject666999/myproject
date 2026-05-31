package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.Account;
import com.cashflow.entity.AccountTransaction;
import com.cashflow.entity.Receivable;
import com.cashflow.mapper.AccountMapper;
import com.cashflow.mapper.AccountTransactionMapper;
import com.cashflow.mapper.ReceivableMapper;
import com.cashflow.service.CurrencyService;
import com.cashflow.service.ReceivableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReceivableServiceImpl extends ServiceImpl<ReceivableMapper, Receivable> implements ReceivableService {

    @Autowired
    private AccountMapper accountMapper;

    @Autowired
    private AccountTransactionMapper transactionMapper;

    @Autowired
    private CurrencyService currencyService;

    @Override
    public IPage<Receivable> pageList(int current, int size, String keyword, String status) {
        LambdaQueryWrapper<Receivable> wrapper = new LambdaQueryWrapper<>();
        if (keyword != null && !keyword.isEmpty()) {
            wrapper.like(Receivable::getCustomerName, keyword);
        }
        if (status != null && !status.isEmpty()) {
            wrapper.eq(Receivable::getStatus, status);
        }
        wrapper.orderByDesc(Receivable::getDueDate);
        return this.page(new Page<>(current, size), wrapper);
    }

    @Override
    public List<Receivable> listByDueDateRange(LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<Receivable> wrapper = new LambdaQueryWrapper<>();
        wrapper.between(Receivable::getDueDate, startDate, endDate)
                .in(Receivable::getStatus, "PENDING", "OVERDUE")
                .orderByAsc(Receivable::getDueDate);
        return this.list(wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Receivable addReceivable(Receivable receivable) {
        if (receivable.getReceivedAmount() == null) {
            receivable.setReceivedAmount(0L);
        }
        if (receivable.getStatus() == null) {
            receivable.setStatus("PENDING");
        }
        if (receivable.getCurrency() == null) {
            receivable.setCurrency("CNY");
        }
        this.save(receivable);
        return receivable;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Receivable updateReceivable(Receivable receivable) {
        this.updateById(receivable);
        return receivable;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteReceivable(Long id) {
        this.removeById(id);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void confirmReceipt(Long id, Long amount, Long accountId) {
        Receivable receivable = this.getById(id);
        if (receivable == null) {
            throw new RuntimeException("应收款项不存在");
        }

        long newReceivedAmount = receivable.getReceivedAmount() + amount;
        receivable.setReceivedAmount(newReceivedAmount);

        if (newReceivedAmount >= receivable.getAmount()) {
            receivable.setStatus("PAID");
        } else {
            receivable.setStatus("PARTIAL");
        }
        this.updateById(receivable);

        Account account = accountMapper.selectById(accountId);
        if (account == null) {
            throw new RuntimeException("账户不存在");
        }
        Long amountInAccountCurrency = currencyService.convert(amount, receivable.getCurrency(), account.getCurrency());
        account.setBalance(account.getBalance() + amountInAccountCurrency);
        accountMapper.updateById(account);

        AccountTransaction transaction = new AccountTransaction();
        transaction.setAccountId(accountId);
        transaction.setType("IN");
        transaction.setAmount(amount);
        transaction.setCurrency(receivable.getCurrency());
        transaction.setDescription("应收款确认: " + receivable.getCustomerName());
        transaction.setTransactionDate(LocalDate.now());
        transaction.setRelatedType("RECEIVABLE");
        transaction.setRelatedId(id);
        transactionMapper.insert(transaction);
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();

        List<Receivable> all = this.list();
        long totalAmount = 0L;
        long totalReceived = 0L;
        long pendingCount = 0L;
        long overdueCount = 0L;
        long overdueAmount = 0L;

        LocalDate today = LocalDate.now();

        for (Receivable r : all) {
            long amountCNY = currencyService.convertToCNY(r.getAmount(), r.getCurrency());
            long receivedCNY = currencyService.convertToCNY(r.getReceivedAmount(), r.getCurrency());
            totalAmount += amountCNY;
            totalReceived += receivedCNY;

            if ("PENDING".equals(r.getStatus()) || "PARTIAL".equals(r.getStatus())) {
                if (r.getDueDate().isBefore(today)) {
                    overdueCount++;
                    overdueAmount += (amountCNY - receivedCNY);
                } else {
                    pendingCount++;
                }
            }
        }

        stats.put("totalAmount", totalAmount);
        stats.put("totalReceived", totalReceived);
        stats.put("pendingAmount", totalAmount - totalReceived);
        stats.put("pendingCount", pendingCount);
        stats.put("overdueCount", overdueCount);
        stats.put("overdueAmount", overdueAmount);

        return stats;
    }
}
