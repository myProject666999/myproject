package com.cashflow.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.cashflow.common.Result;
import com.cashflow.entity.Account;
import com.cashflow.entity.AccountTransaction;
import com.cashflow.service.AccountService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/accounts")
@CrossOrigin
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public Result<List<Account>> list() {
        return Result.success(accountService.listAll());
    }

    @GetMapping("/summary")
    public Result<Map<String, Object>> summary() {
        return Result.success(accountService.getSummary());
    }

    @GetMapping("/{id}")
    public Result<Account> getById(@PathVariable Long id) {
        return Result.success(accountService.getById(id));
    }

    @GetMapping("/{id}/transactions")
    public Result<IPage<AccountTransaction>> transactions(@PathVariable Long id,
                                                          @RequestParam(defaultValue = "1") int current,
                                                          @RequestParam(defaultValue = "10") int size) {
        return Result.success(accountService.getTransactionHistory(id, current, size));
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
        accountService.deleteAccount(id);
        return Result.success();
    }
}
