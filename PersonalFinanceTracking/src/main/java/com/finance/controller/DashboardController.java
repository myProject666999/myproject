package com.finance.controller;

import com.finance.service.AccountService;
import com.finance.service.ReportService;
import com.finance.service.TransactionService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/")
public class DashboardController {

    private final AccountService accountService;
    private final TransactionService transactionService;
    private final ReportService reportService;

    public DashboardController(AccountService accountService, TransactionService transactionService, ReportService reportService) {
        this.accountService = accountService;
        this.transactionService = transactionService;
        this.reportService = reportService;
    }

    @GetMapping
    public String dashboard(Model model) {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();

        BigDecimal totalBalance = accountService.getTotalBalance();
        BigDecimal monthIncome = transactionService.sumByTypeAndMonth("income", year, month);
        BigDecimal monthExpense = transactionService.sumByTypeAndMonth("expense", year, month);
        BigDecimal netIncome = monthIncome.subtract(monthExpense);

        Map<String, Object> trendData = reportService.getTrendData(6);
        List<Map<String, Object>> recentTransactions = reportService.getRecentTransactions(10);
        List<com.finance.entity.Account> accounts = accountService.findAll();
        List<Map<String, Object>> budgetComparison = reportService.getBudgetComparison(year, month);
        List<Object[]> expenseByCategory = transactionService.sumByCategoryAndMonth("expense", year, month);

        model.addAttribute("totalBalance", totalBalance);
        model.addAttribute("monthIncome", monthIncome);
        model.addAttribute("monthExpense", monthExpense);
        model.addAttribute("netIncome", netIncome);
        model.addAttribute("trendData", trendData);
        model.addAttribute("recentTransactions", recentTransactions);
        model.addAttribute("accounts", accounts);
        model.addAttribute("budgetComparison", budgetComparison);
        model.addAttribute("expenseByCategory", expenseByCategory);
        model.addAttribute("currentYear", year);
        model.addAttribute("currentMonth", month);

        return "dashboard";
    }
}
