package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.Account;
import com.cashflow.entity.AccountTransaction;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface AccountService extends IService<Account> {

    List<Account> listAll();

    Map<String, Object> getSummary();

    IPage<AccountTransaction> getTransactionHistory(Long accountId, int current, int size);

    Account addAccount(Account account);

    Account updateAccount(Account account);

    void deleteAccount(Long id);

    Long convertToCNY(Long amount, String currency);

    BigDecimal getExchangeRate(String fromCurrency, String toCurrency);
}
