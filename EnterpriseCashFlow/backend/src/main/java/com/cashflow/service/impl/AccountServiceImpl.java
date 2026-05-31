package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.Account;
import com.cashflow.entity.AccountTransaction;
import com.cashflow.mapper.AccountMapper;
import com.cashflow.mapper.AccountTransactionMapper;
import com.cashflow.service.AccountService;
import com.cashflow.service.CurrencyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AccountServiceImpl extends ServiceImpl<AccountMapper, Account> implements AccountService {

    @Autowired
    private AccountTransactionMapper transactionMapper;

    @Autowired
    private CurrencyService currencyService;

    @Override
    public List<Account> listAll() {
        return this.list();
    }

    @Override
    public Map<String, Object> getSummary() {
        Map<String, Object> summary = new HashMap<>();
        List<Account> accounts = this.list();

        long totalBalance = 0L;
        long cnyBalance = 0L;
        Map<String, Long> currencyBalances = new HashMap<>();

        for (Account account : accounts) {
            Long balance = account.getBalance();
            String currency = account.getCurrency();

            currencyBalances.put(currency, currencyBalances.getOrDefault(currency, 0L) + balance);
            totalBalance += currencyService.convertToCNY(balance, currency);
            if ("CNY".equals(currency)) {
                cnyBalance += balance;
            }
        }

        summary.put("accountCount", accounts.size());
        summary.put("totalBalance", totalBalance);
        summary.put("cnyBalance", cnyBalance);
        summary.put("currencyBalances", currencyBalances);

        return summary;
    }

    @Override
    public IPage<AccountTransaction> getTransactionHistory(Long accountId, int current, int size) {
        LambdaQueryWrapper<AccountTransaction> wrapper = new LambdaQueryWrapper<>();
        if (accountId != null) {
            wrapper.eq(AccountTransaction::getAccountId, accountId);
        }
        wrapper.orderByDesc(AccountTransaction::getTransactionDate);
        return transactionMapper.selectPage(new Page<>(current, size), wrapper);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Account addAccount(Account account) {
        if (account.getBalance() == null) {
            account.setBalance(0L);
        }
        if (account.getCurrency() == null) {
            account.setCurrency("CNY");
        }
        this.save(account);
        return account;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Account updateAccount(Account account) {
        this.updateById(account);
        return account;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteAccount(Long id) {
        this.removeById(id);
    }

    @Override
    public Long convertToCNY(Long amount, String currency) {
        return currencyService.convertToCNY(amount, currency);
    }

    @Override
    public BigDecimal getExchangeRate(String fromCurrency, String toCurrency) {
        return currencyService.getRate(fromCurrency, toCurrency);
    }
}
