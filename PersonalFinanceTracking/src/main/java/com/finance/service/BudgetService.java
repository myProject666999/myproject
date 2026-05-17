package com.finance.service;

import com.finance.entity.Budget;
import com.finance.repository.BudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;

    public BudgetService(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public List<Budget> findByYearAndMonth(Integer year, Integer month) {
        return budgetRepository.findByYearAndMonthOrderByIdAsc(year, month);
    }

    public List<Budget> findExpenseBudgetsByYearAndMonth(Integer year, Integer month) {
        return budgetRepository.findExpenseBudgetsByYearAndMonth(year, month);
    }

    public Optional<Budget> findByCategoryIdAndYearAndMonth(Long categoryId, Integer year, Integer month) {
        return budgetRepository.findByCategoryIdAndYearAndMonth(categoryId, year, month);
    }

    public Budget findById(Long id) {
        return budgetRepository.findById(id).orElseThrow(() -> new RuntimeException("预算不存在"));
    }

    @Transactional
    public Budget save(Budget budget) {
        Optional<Budget> existing = findByCategoryIdAndYearAndMonth(
                budget.getCategoryId(), budget.getYear(), budget.getMonth());
        if (existing.isPresent() && !existing.get().getId().equals(budget.getId())) {
            throw new RuntimeException("该分类本月已设置预算");
        }
        return budgetRepository.save(budget);
    }

    @Transactional
    public void delete(Long id) {
        budgetRepository.deleteById(id);
    }
}
