package com.finance.service;

import com.finance.entity.Transaction;
import com.finance.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountService accountService;

    public TransactionService(TransactionRepository transactionRepository, AccountService accountService) {
        this.transactionRepository = transactionRepository;
        this.accountService = accountService;
    }

    public List<Transaction> findAll() {
        return transactionRepository.findAllByOrderByTransactionDateDescCreatedAtDesc();
    }

    public List<Transaction> findByDateRange(LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(startDate, endDate);
    }

    public List<Transaction> findByTypeAndDateRange(String type, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.findByTypeAndTransactionDateBetweenOrderByTransactionDateDescCreatedAtDesc(type, startDate, endDate);
    }

    public Transaction findById(Long id) {
        return transactionRepository.findById(id).orElseThrow(() -> new RuntimeException("交易记录不存在"));
    }

    @Transactional
    public Transaction save(Transaction transaction) {
        Transaction saved = transactionRepository.save(transaction);
        accountService.updateBalance(transaction.getAccountId(), transaction.getAmount(), transaction.getType());
        return saved;
    }

    @Transactional
    public void delete(Long id) {
        Transaction transaction = findById(id);
        String reverseType = "income".equals(transaction.getType()) ? "expense" : "income";
        accountService.updateBalance(transaction.getAccountId(), transaction.getAmount(), reverseType);
        transactionRepository.deleteById(id);
    }

    public BigDecimal sumByTypeAndMonth(String type, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return transactionRepository.sumByTypeAndDateRange(type, startDate, endDate);
    }

    public List<Object[]> sumByCategoryAndMonth(String type, int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return transactionRepository.sumByCategoryAndDateRange(type, startDate, endDate);
    }

    public List<Object[]> sumByMonthAndType(String type, LocalDate startDate, LocalDate endDate) {
        return transactionRepository.sumByMonthAndType(type, startDate, endDate);
    }

    public List<Object[]> sumByAccountAndMonth(int year, int month) {
        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.plusMonths(1).minusDays(1);
        return transactionRepository.sumByAccountAndDateRange(startDate, endDate);
    }
}
