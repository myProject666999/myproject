package com.cashflow.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.service.IService;
import com.cashflow.entity.Account;

import java.util.List;

public interface AccountService extends IService<Account> {

    IPage<Account> pageList(int current, int size, String keyword);

    List<Account> listByCompanyId(Long companyId);

    Long getTotalBalance(Long companyId);

    Account addAccount(Account account);

    Account updateAccount(Account account);
}
