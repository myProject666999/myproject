package com.family.shoppinglist.controller;

import com.family.shoppinglist.entity.PurchaseRecord;
import com.family.shoppinglist.service.PurchaseRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/records")
public class PurchaseRecordController {

    @Autowired
    private PurchaseRecordService purchaseRecordService;

    @GetMapping
    public List<PurchaseRecord> findByMonth(@RequestParam int year, @RequestParam int month) {
        return purchaseRecordService.findByMonth(year, month);
    }

    @GetMapping("/total")
    public BigDecimal getMonthTotal(@RequestParam int year, @RequestParam int month) {
        return purchaseRecordService.getMonthTotal(year, month);
    }

    @GetMapping("/category-summary")
    public Map<String, BigDecimal> getCategorySummary(@RequestParam int year, @RequestParam int month) {
        return purchaseRecordService.getCategorySummary(year, month);
    }

    @PostMapping
    public PurchaseRecord save(@RequestBody PurchaseRecord record) {
        return purchaseRecordService.save(record);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        purchaseRecordService.delete(id);
    }
}
