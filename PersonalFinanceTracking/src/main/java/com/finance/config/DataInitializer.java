package com.finance.config;

import com.finance.entity.Account;
import com.finance.entity.Category;
import com.finance.repository.AccountRepository;
import com.finance.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final CategoryRepository categoryRepository;

    public DataInitializer(AccountRepository accountRepository, CategoryRepository categoryRepository) {
        this.accountRepository = accountRepository;
        this.categoryRepository = categoryRepository;
    }

    @Override
    public void run(String... args) {
        if (accountRepository.count() == 0) {
            initAccounts();
        }
        if (categoryRepository.count() == 0) {
            initCategories();
        }
    }

    private void initAccounts() {
        List<Account> accounts = Arrays.asList(
                createAccount("现金", "现金", "日常使用的现金"),
                createAccount("工资卡", "银行卡", "主要工资卡"),
                createAccount("支付宝", "支付宝", "支付宝账户"),
                createAccount("微信钱包", "微信", "微信支付账户")
        );
        accountRepository.saveAll(accounts);
    }

    private Account createAccount(String name, String type, String description) {
        Account account = new Account();
        account.setName(name);
        account.setType(type);
        account.setBalance(BigDecimal.ZERO);
        account.setDescription(description);
        return account;
    }

    private void initCategories() {
        List<Category> categories = Arrays.asList(
                createCategory("餐饮", "expense", "[餐]", 1),
                createCategory("交通", "expense", "[车]", 2),
                createCategory("购物", "expense", "[购]", 3),
                createCategory("娱乐", "expense", "[娱]", 4),
                createCategory("医疗", "expense", "[医]", 5),
                createCategory("教育", "expense", "[教]", 6),
                createCategory("住房", "expense", "[房]", 7),
                createCategory("通讯", "expense", "[通]", 8),
                createCategory("其他支出", "expense", "[其]", 99),
                createCategory("工资", "income", "[工]", 1),
                createCategory("奖金", "income", "[奖]", 2),
                createCategory("投资收益", "income", "[投]", 3),
                createCategory("兼职", "income", "[兼]", 4),
                createCategory("其他收入", "income", "[其]", 99)
        );
        categoryRepository.saveAll(categories);
    }

    private Category createCategory(String name, String type, String icon, int sortOrder) {
        Category category = new Category();
        category.setName(name);
        category.setType(type);
        category.setIcon(icon);
        category.setSortOrder(sortOrder);
        return category;
    }
}
