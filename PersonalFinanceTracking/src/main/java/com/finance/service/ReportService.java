package com.finance.service;

import com.finance.entity.Budget;
import com.finance.entity.Category;
import com.finance.entity.Transaction;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionService transactionService;
    private final CategoryService categoryService;
    private final BudgetService budgetService;

    public ReportService(TransactionService transactionService, CategoryService categoryService, BudgetService budgetService) {
        this.transactionService = transactionService;
        this.categoryService = categoryService;
        this.budgetService = budgetService;
    }

    public Map<String, Object> getMonthlyReport(int year, int month) {
        Map<String, Object> report = new LinkedHashMap<>();

        BigDecimal totalIncome = transactionService.sumByTypeAndMonth("income", year, month);
        BigDecimal totalExpense = transactionService.sumByTypeAndMonth("expense", year, month);
        BigDecimal netIncome = totalIncome.subtract(totalExpense);

        report.put("year", year);
        report.put("month", month);
        report.put("totalIncome", totalIncome);
        report.put("totalExpense", totalExpense);
        report.put("netIncome", netIncome);

        List<Object[]> incomeByCategory = transactionService.sumByCategoryAndMonth("income", year, month);
        List<Object[]> expenseByCategory = transactionService.sumByCategoryAndMonth("expense", year, month);

        report.put("incomeByCategory", incomeByCategory);
        report.put("expenseByCategory", expenseByCategory);

        List<Map<String, Object>> budgetComparison = getBudgetComparison(year, month);
        report.put("budgetComparison", budgetComparison);

        return report;
    }

    public List<Map<String, Object>> getBudgetComparison(int year, int month) {
        List<Map<String, Object>> result = new ArrayList<>();
        List<Budget> budgets = budgetService.findExpenseBudgetsByYearAndMonth(year, month);
        List<Object[]> expenseByCategory = transactionService.sumByCategoryAndMonth("expense", year, month);

        Map<Long, BigDecimal> expenseMap = expenseByCategory.stream()
                .collect(Collectors.toMap(
                        row -> (Long) row[0],
                        row -> (BigDecimal) row[3]
                ));

        for (Budget budget : budgets) {
            Map<String, Object> item = new LinkedHashMap<>();
            Category category = categoryService.findById(budget.getCategoryId());
            BigDecimal spent = expenseMap.getOrDefault(budget.getCategoryId(), BigDecimal.ZERO);
            BigDecimal remaining = budget.getBudgetAmount().subtract(spent);
            int percentage = budget.getBudgetAmount().compareTo(BigDecimal.ZERO) > 0
                    ? spent.multiply(BigDecimal.valueOf(100)).divide(budget.getBudgetAmount(), 0, java.math.RoundingMode.HALF_UP).intValue()
                    : 0;

            item.put("categoryId", category.getId());
            item.put("categoryName", category.getName());
            item.put("categoryIcon", category.getIcon());
            item.put("budgetAmount", budget.getBudgetAmount());
            item.put("spent", spent);
            item.put("remaining", remaining);
            item.put("percentage", Math.min(percentage, 100));
            item.put("overBudget", spent.compareTo(budget.getBudgetAmount()) > 0);

            result.add(item);
        }

        return result;
    }

    public Map<String, Object> getTrendData(int months) {
        Map<String, Object> result = new LinkedHashMap<>();
        LocalDate endDate = LocalDate.now().withDayOfMonth(1);
        LocalDate startDate = endDate.minusMonths(months - 1);

        List<Object[]> incomeTrend = transactionService.sumByMonthAndType("income", startDate, endDate);
        List<Object[]> expenseTrend = transactionService.sumByMonthAndType("expense", startDate, endDate);

        Map<String, BigDecimal> incomeMap = incomeTrend.stream()
                .collect(Collectors.toMap(row -> (String) row[0], row -> (BigDecimal) row[1]));
        Map<String, BigDecimal> expenseMap = expenseTrend.stream()
                .collect(Collectors.toMap(row -> (String) row[0], row -> (BigDecimal) row[1]));

        List<String> labels = new ArrayList<>();
        List<BigDecimal> incomeData = new ArrayList<>();
        List<BigDecimal> expenseData = new ArrayList<>();

        for (int i = 0; i < months; i++) {
            LocalDate date = startDate.plusMonths(i);
            String label = date.getYear() + "-" + String.format("%02d", date.getMonthValue());
            labels.add(label);
            incomeData.add(incomeMap.getOrDefault(label, BigDecimal.ZERO));
            expenseData.add(expenseMap.getOrDefault(label, BigDecimal.ZERO));
        }

        result.put("labels", labels);
        result.put("incomeData", incomeData);
        result.put("expenseData", expenseData);

        return result;
    }

    public List<Map<String, Object>> getRecentTransactions(int limit) {
        List<Transaction> all = transactionService.findAll();
        return all.stream()
                .limit(limit)
                .map(t -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", t.getId());
                    map.put("type", t.getType());
                    map.put("amount", t.getAmount());
                    map.put("description", t.getDescription());
                    map.put("date", t.getTransactionDate());
                    map.put("category", categoryService.findById(t.getCategoryId()));
                    return map;
                })
                .collect(Collectors.toList());
    }
}
