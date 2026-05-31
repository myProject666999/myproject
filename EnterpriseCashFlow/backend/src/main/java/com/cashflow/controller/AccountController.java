package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.Account;
import com.cashflow.service.AccountService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping("/page")
    public Result<IPage<Account>> page(@RequestParam(defaultValue = "1") int current,
                                       @RequestParam(defaultValue = "10") int size,
                                       @RequestParam(required = false) String keyword) {
        return Result.success(accountService.pageList(current, size, keyword));
    }

    @GetMapping("/company/{companyId}")
    public Result<List<Account>> listByCompany(@PathVariable Long companyId) {
        return Result.success(accountService.listByCompanyId(companyId));
    }

    @GetMapping("/totalBalance/{companyId}")
    public Result<Long> totalBalance(@PathVariable Long companyId) {
        return Result.success(accountService.getTotalBalance(companyId));
    }

    @GetMapping("/{id}")
    public Result<Account> getById(@PathVariable Long id) {
        return Result.success(accountService.getById(id));
    }

    @PostMapping
    public Result<Account> add(@RequestBody Account account) {
        return Result.success(accountService.addAccount(account));
    }

    @PutMapping
    public Result<Account> update(@RequestBody Account account) {
        return Result.success(accountService.updateAccount(account));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        accountService.removeById(id);
        return Result.success();
    }
}
