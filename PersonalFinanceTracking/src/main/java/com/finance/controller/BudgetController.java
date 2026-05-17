package com.finance.controller;

import com.finance.entity.Budget;
import com.finance.service.BudgetService;
import com.finance.service.CategoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.time.LocalDate;

@Controller
@RequestMapping("/budgets")
public class BudgetController {

    private final BudgetService budgetService;
    private final CategoryService categoryService;

    public BudgetController(BudgetService budgetService, CategoryService categoryService) {
        this.budgetService = budgetService;
        this.categoryService = categoryService;
    }

    @GetMapping
    public String list(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            Model model) {

        LocalDate now = LocalDate.now();
        year = (year == null) ? now.getYear() : year;
        month = (month == null) ? now.getMonthValue() : month;

        model.addAttribute("budgets", budgetService.findByYearAndMonth(year, month));
        model.addAttribute("expenseCategories", categoryService.findByType("expense"));
        model.addAttribute("year", year);
        model.addAttribute("month", month);
        model.addAttribute("budget", new Budget());

        return "budgets/list";
    }

    @PostMapping
    public String save(Budget budget, RedirectAttributes redirectAttributes) {
        try {
            budgetService.save(budget);
            redirectAttributes.addFlashAttribute("success", "预算设置成功");
        } catch (RuntimeException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/budgets?year=" + budget.getYear() + "&month=" + budget.getMonth();
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        Budget budget = budgetService.findById(id);
        budgetService.delete(id);
        redirectAttributes.addFlashAttribute("success", "预算删除成功");
        return "redirect:/budgets?year=" + budget.getYear() + "&month=" + budget.getMonth();
    }
}
