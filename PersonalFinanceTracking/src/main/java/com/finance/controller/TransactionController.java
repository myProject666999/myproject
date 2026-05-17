package com.finance.controller;

import com.finance.entity.Transaction;
import com.finance.service.AccountService;
import com.finance.service.CategoryService;
import com.finance.service.TransactionService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;
import java.util.List;

@Controller
@RequestMapping("/transactions")
public class TransactionController {

    private final TransactionService transactionService;
    private final AccountService accountService;
    private final CategoryService categoryService;

    public TransactionController(TransactionService transactionService, AccountService accountService, CategoryService categoryService) {
        this.transactionService = transactionService;
        this.accountService = accountService;
        this.categoryService = categoryService;
    }

    @GetMapping
    public String list(
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) String type,
            Model model) {

        List<Transaction> transactions;
        LocalDate now = LocalDate.now();
        if (startDate == null) {
            startDate = now.withDayOfMonth(1);
        }
        if (endDate == null) {
            endDate = now;
        }

        if (type != null && !type.isEmpty()) {
            transactions = transactionService.findByTypeAndDateRange(type, startDate, endDate);
        } else {
            transactions = transactionService.findByDateRange(startDate, endDate);
        }

        model.addAttribute("transactions", transactions);
        model.addAttribute("startDate", startDate);
        model.addAttribute("endDate", endDate);
        model.addAttribute("selectedType", type);
        model.addAttribute("categoryService", categoryService);
        model.addAttribute("accountService", accountService);

        return "transactions/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("transaction", new Transaction());
        model.addAttribute("accounts", accountService.findAll());
        model.addAttribute("expenseCategories", categoryService.findByType("expense"));
        model.addAttribute("incomeCategories", categoryService.findByType("income"));
        model.addAttribute("today", LocalDate.now());
        return "transactions/form";
    }

    @PostMapping
    public String save(Transaction transaction, RedirectAttributes redirectAttributes) {
        if (transaction.getTransactionDate() == null) {
            transaction.setTransactionDate(LocalDate.now());
        }
        transactionService.save(transaction);
        redirectAttributes.addFlashAttribute("success", "记录添加成功");
        return "redirect:/transactions";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        transactionService.delete(id);
        redirectAttributes.addFlashAttribute("success", "记录删除成功");
        return "redirect:/transactions";
    }
}
