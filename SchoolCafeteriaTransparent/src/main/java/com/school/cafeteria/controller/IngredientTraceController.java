package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.entity.IngredientTrace;
import com.school.cafeteria.service.IngredientTraceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/ingredient")
public class IngredientTraceController {

    @Autowired
    private IngredientTraceService ingredientTraceService;

    @GetMapping("/public/list")
    public Result<List<IngredientTrace>> getAll() {
        List<IngredientTrace> list = ingredientTraceService.findAll();
        return Result.success(list);
    }

    @GetMapping("/public/{id}")
    public Result<IngredientTrace> getById(@PathVariable Long id) {
        Optional<IngredientTrace> trace = ingredientTraceService.findById(id);
        return trace.map(Result::success).orElse(Result.error("记录不存在"));
    }

    @GetMapping("/public/batch/{batchNo}")
    public Result<IngredientTrace> getByBatchNo(@PathVariable String batchNo) {
        Optional<IngredientTrace> trace = ingredientTraceService.findByBatchNo(batchNo);
        return trace.map(Result::success).orElse(Result.error("批次不存在"));
    }

    @GetMapping("/public/range")
    public Result<List<IngredientTrace>> getByDateRange(
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate) {
        List<IngredientTrace> list = ingredientTraceService.findByDateRange(startDate, endDate);
        return Result.success(list);
    }

    @GetMapping("/public/search")
    public Result<List<IngredientTrace>> search(@RequestParam String keyword) {
        List<IngredientTrace> list = ingredientTraceService.searchByIngredientName(keyword);
        return Result.success(list);
    }

    @PostMapping
    public Result<IngredientTrace> create(@RequestBody IngredientTrace trace) {
        IngredientTrace saved = ingredientTraceService.save(trace);
        return Result.success("创建成功", saved);
    }

    @PutMapping("/{id}")
    public Result<IngredientTrace> update(@PathVariable Long id, @RequestBody IngredientTrace trace) {
        Optional<IngredientTrace> existing = ingredientTraceService.findById(id);
        if (!existing.isPresent()) {
            return Result.error("记录不存在");
        }
        trace.setId(id);
        IngredientTrace saved = ingredientTraceService.save(trace);
        return Result.success("更新成功", saved);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        ingredientTraceService.delete(id);
        return Result.success();
    }
}
