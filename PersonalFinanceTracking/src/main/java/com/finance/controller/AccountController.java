package com.finance.controller;

import com.finance.entity.Account;
import com.finance.service.AccountService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("accounts", accountService.findAll());
        model.addAttribute("totalBalance", accountService.getTotalBalance());
        return "accounts/list";
    }

    @GetMapping("/add")
    public String addForm(Model model) {
        model.addAttribute("account", new Account());
        return "accounts/form";
    }

    @PostMapping
    public String save(Account account, RedirectAttributes redirectAttributes) {
        accountService.save(account);
        redirectAttributes.addFlashAttribute("success", "账户添加成功");
        return "redirect:/accounts";
    }

    @PostMapping("/{id}/delete")
    public String delete(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        accountService.delete(id);
        redirectAttributes.addFlashAttribute("success", "账户删除成功");
        return "redirect:/accounts";
    }
}
