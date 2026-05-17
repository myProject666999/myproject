package com.finance.controller;

import com.finance.service.ReportService;
import com.finance.service.TransactionService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/reports")
public class ReportController {

    private final ReportService reportService;
    private final TransactionService transactionService;

    public ReportController(ReportService reportService, TransactionService transactionService) {
        this.reportService = reportService;
        this.transactionService = transactionService;
    }

    @GetMapping
    public String reports(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Model model) {

        LocalDate now = LocalDate.now();
        year = (year == null) ? now.getYear() : year;
        month = (month == null) ? now.getMonthValue() : month;

        Map<String, Object> monthlyReport = reportService.getMonthlyReport(year, month);
        Map<String, Object> trendData = reportService.getTrendData(12);
        List<Object[]> expenseByCategory = transactionService.sumByCategoryAndMonth("expense", year, month);
        List<Object[]> incomeByCategory = transactionService.sumByCategoryAndMonth("income", year, month);
        List<Object[]> accountSummary = transactionService.sumByAccountAndMonth(year, month);

        model.addAttribute("report", monthlyReport);
        model.addAttribute("trendData", trendData);
        model.addAttribute("expenseByCategory", expenseByCategory);
        model.addAttribute("incomeByCategory", incomeByCategory);
        model.addAttribute("accountSummary", accountSummary);
        model.addAttribute("year", year);
        model.addAttribute("month", month);

        return "reports/monthly";
    }
}
