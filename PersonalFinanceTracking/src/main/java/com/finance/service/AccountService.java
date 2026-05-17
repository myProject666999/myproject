package com.finance.service;

import com.finance.entity.Account;
import com.finance.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public List<Account> findAll() {
        return accountRepository.findAllByOrderByCreatedAtAsc();
    }

    public Account findById(Long id) {
        return accountRepository.findById(id).orElseThrow(() -> new RuntimeException("账户不存在"));
    }

    @Transactional
    public Account save(Account account) {
        if (account.getBalance() == null) {
            account.setBalance(BigDecimal.ZERO);
        }
        return accountRepository.save(account);
    }

    @Transactional
    public void delete(Long id) {
        accountRepository.deleteById(id);
    }

    @Transactional
    public void updateBalance(Long accountId, BigDecimal amount, String type) {
        Account account = findById(accountId);
        BigDecimal currentBalance = account.getBalance();
        if ("income".equals(type)) {
            account.setBalance(currentBalance.add(amount));
        } else {
            account.setBalance(currentBalance.subtract(amount));
        }
        accountRepository.save(account);
    }

    public BigDecimal getTotalBalance() {
        return accountRepository.findAll().stream()
                .map(Account::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
