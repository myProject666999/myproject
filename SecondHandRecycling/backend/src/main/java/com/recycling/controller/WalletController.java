package com.recycling.controller;

import com.recycling.common.Result;
import com.recycling.entity.UserWallet;
import com.recycling.entity.WalletTransaction;
import com.recycling.security.UserPrincipal;
import com.recycling.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @GetMapping
    public Result<UserWallet> getWallet(@AuthenticationPrincipal UserPrincipal principal) {
        return Result.success(walletService.getUserWallet(principal.getUserId()));
    }

    @GetMapping("/transactions")
    public Result<List<WalletTransaction>> getTransactions(@AuthenticationPrincipal UserPrincipal principal,
                                                           @RequestParam(required = false) String type) {
        return Result.success(walletService.getTransactions(principal.getUserId(), type));
    }

    @PostMapping("/withdraw")
    public Result<Void> withdraw(@AuthenticationPrincipal UserPrincipal principal,
                                 @RequestParam BigDecimal amount) {
        walletService.withdraw(principal.getUserId(), amount);
        return Result.success();
    }
}
