package com.creator.platform.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.creator.platform.common.Result;
import com.creator.platform.entity.CreatorAccount;
import com.creator.platform.entity.Platform;
import com.creator.platform.mapper.CreatorAccountMapper;
import com.creator.platform.mapper.PlatformMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/account")
@RequiredArgsConstructor
public class AccountController {

    private final CreatorAccountMapper creatorAccountMapper;
    private final PlatformMapper platformMapper;

    @GetMapping("/platforms")
    public Result<List<Platform>> getPlatforms() {
        return Result.success(platformMapper.selectList(null));
    }

    @GetMapping("/list")
    public Result<List<CreatorAccount>> getAccountList(@RequestParam Long creatorId) {
        return Result.success(creatorAccountMapper.selectList(
                new LambdaQueryWrapper<CreatorAccount>()
                        .eq(CreatorAccount::getCreatorId, creatorId)
                        .eq(CreatorAccount::getDeleted, 0)
                        .orderByDesc(CreatorAccount::getCreateTime)
        ));
    }

    @PostMapping("/bind")
    public Result<CreatorAccount> bindAccount(@RequestBody CreatorAccount account) {
        account.setBindTime(LocalDateTime.now());
        account.setSyncStatus(0);
        account.setStatus(1);
        creatorAccountMapper.insert(account);
        return Result.success(account);
    }

    @PostMapping("/unbind")
    public Result<Void> unbindAccount(@RequestParam Long accountId) {
        CreatorAccount account = creatorAccountMapper.selectById(accountId);
        if (account != null) {
            account.setStatus(0);
            creatorAccountMapper.updateById(account);
        }
        return Result.success();
    }

    @GetMapping("/{id}")
    public Result<CreatorAccount> getAccount(@PathVariable Long id) {
        return Result.success(creatorAccountMapper.selectById(id));
    }
}
