package com.finance.service;

import com.finance.entity.Category;
import com.finance.entity.Transaction;
import com.opencsv.CSVReader;
import com.opencsv.CSVWriter;
import com.opencsv.exceptions.CsvException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class CsvService {

    private final TransactionService transactionService;
    private final CategoryService categoryService;
    private final AccountService accountService;

    public CsvService(TransactionService transactionService, CategoryService categoryService, AccountService accountService) {
        this.transactionService = transactionService;
        this.categoryService = categoryService;
        this.accountService = accountService;
    }

    public ByteArrayInputStream exportTransactions() throws IOException {
        List<Transaction> transactions = transactionService.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        CSVWriter writer = new CSVWriter(new OutputStreamWriter(out, StandardCharsets.UTF_8));

        String[] header = {"ID", "类型", "金额", "分类", "账户", "描述", "日期", "创建时间"};
        writer.writeNext(header);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Transaction t : transactions) {
            String type = "income".equals(t.getType()) ? "收入" : "支出";
            String categoryName = categoryService.findById(t.getCategoryId()).getName();
            String accountName = accountService.findById(t.getAccountId()).getName();
            String[] row = {
                    String.valueOf(t.getId()),
                    type,
                    t.getAmount().toString(),
                    categoryName,
                    accountName,
                    t.getDescription() != null ? t.getDescription() : "",
                    t.getTransactionDate().format(dateFormatter),
                    t.getCreatedAt().format(dateTimeFormatter)
            };
            writer.writeNext(row);
        }

        writer.close();
        return new ByteArrayInputStream(out.toByteArray());
    }

    public int importTransactions(MultipartFile file) throws IOException, CsvException {
        int count = 0;
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        try (CSVReader reader = new CSVReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            List<String[]> rows = reader.readAll();

            boolean isFirstRow = true;
            for (String[] row : rows) {
                if (isFirstRow) {
                    isFirstRow = false;
                    if (isHeaderRow(row)) {
                        continue;
                    }
                }

                if (row.length < 5) {
                    continue;
                }

                try {
                    Transaction transaction = new Transaction();

                    String typeStr = row[1].trim();
                    transaction.setType("收入".equals(typeStr) || "income".equalsIgnoreCase(typeStr) ? "income" : "expense");

                    transaction.setAmount(new BigDecimal(row[2].trim()));

                    String categoryName = row[3].trim();
                    Category category = findCategoryByName(categoryName, transaction.getType());
                    if (category == null) {
                        continue;
                    }
                    transaction.setCategoryId(category.getId());

                    String accountName = row[4].trim();
                    Long accountId = findAccountIdByName(accountName);
                    if (accountId == null) {
                        continue;
                    }
                    transaction.setAccountId(accountId);

                    if (row.length > 5) {
                        transaction.setDescription(row[5].trim());
                    }

                    if (row.length > 6 && row[6] != null && !row[6].trim().isEmpty()) {
                        transaction.setTransactionDate(LocalDate.parse(row[6].trim(), dateFormatter));
                    } else {
                        transaction.setTransactionDate(LocalDate.now());
                    }

                    transactionService.save(transaction);
                    count++;
                } catch (Exception e) {
                    continue;
                }
            }
        }

        return count;
    }

    private boolean isHeaderRow(String[] row) {
        if (row.length == 0) return false;
        String firstCell = row[0].trim().toLowerCase();
        return firstCell.contains("id") || firstCell.contains("类型") || firstCell.contains("type");
    }

    private Category findCategoryByName(String name, String type) {
        List<Category> categories = categoryService.findByType(type);
        for (Category c : categories) {
            if (c.getName().equals(name)) {
                return c;
            }
        }
        return null;
    }

    private Long findAccountIdByName(String name) {
        return accountService.findAll().stream()
                .filter(a -> a.getName().equals(name))
                .map(com.finance.entity.Account::getId)
                .findFirst()
                .orElse(null);
    }
}
