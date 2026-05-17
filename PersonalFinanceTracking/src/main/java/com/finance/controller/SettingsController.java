package com.finance.controller;

import com.finance.service.AccountService;
import com.finance.service.CategoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/settings")
public class SettingsController {

    private final AccountService accountService;
    private final CategoryService categoryService;

    public SettingsController(AccountService accountService, CategoryService categoryService) {
        this.accountService = accountService;
        this.categoryService = categoryService;
    }

    @GetMapping
    public String settings(Model model) {
        model.addAttribute("accounts", accountService.findAll());
        model.addAttribute("categories", categoryService.findAll());
        return "settings";
    }
}
