package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.Account;
import com.cashflow.mapper.AccountMapper;
import com.cashflow.service.AccountService;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class AccountServiceImpl extends ServiceImpl<AccountMapper, Account> implements AccountService {

    private final RedisTemplate<String, Object> redisTemplate;

    public AccountServiceImpl(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    public IPage<Account> pageList(int current, int size, String keyword) {
        Page<Account> page = new Page<>(current, size);
        LambdaQueryWrapper<Account> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Account::getAccountName, keyword)
                    .or().like(Account::getAccountNo, keyword)
                    .or().like(Account::getBankName, keyword);
        }
        wrapper.orderByDesc(Account::getCreatedAt);
        return this.page(page, wrapper);
    }

    @Override
    public List<Account> listByCompanyId(Long companyId) {
        LambdaQueryWrapper<Account> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Account::getCompanyId, companyId)
                .eq(Account::getStatus, 1)
                .orderByDesc(Account::getCreatedAt);
        return this.list(wrapper);
    }

    @Override
    public Long getTotalBalance(Long companyId) {
        String cacheKey = "account:totalBalance:" + companyId;
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) {
            return (Long) cached;
        }
        List<Account> accounts = listByCompanyId(companyId);
        long total = accounts.stream().mapToLong(Account::getBalance).sum();
        redisTemplate.opsForValue().set(cacheKey, total, 30, TimeUnit.MINUTES);
        return total;
    }

    @Override
    public Account addAccount(Account account) {
        this.save(account);
        redisTemplate.delete("account:totalBalance:" + account.getCompanyId());
        return account;
    }

    @Override
    public Account updateAccount(Account account) {
        this.updateById(account);
        redisTemplate.delete("account:totalBalance:" + account.getCompanyId());
        return account;
    }
}
