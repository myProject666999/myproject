package com.finance.controller;

import com.finance.service.CsvService;
import com.opencsv.exceptions.CsvException;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
@RequestMapping("/csv")
public class CsvController {

    private final CsvService csvService;

    public CsvController(CsvService csvService) {
        this.csvService = csvService;
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportCsv() throws IOException {
        ByteArrayInputStream in = csvService.exportTransactions();

        String filename = "transactions_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + filename);

        return ResponseEntity
                .ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(new InputStreamResource(in));
    }

    @PostMapping("/import")
    public String importCsv(@RequestParam("file") MultipartFile file, RedirectAttributes redirectAttributes) {
        if (file.isEmpty()) {
            redirectAttributes.addFlashAttribute("error", "请选择要上传的文件");
            return "redirect:/settings";
        }

        try {
            int count = csvService.importTransactions(file);
            redirectAttributes.addFlashAttribute("success", "成功导入 " + count + " 条记录");
        } catch (IOException | CsvException e) {
            redirectAttributes.addFlashAttribute("error", "导入失败: " + e.getMessage());
        }

        return "redirect:/settings";
    }
}
