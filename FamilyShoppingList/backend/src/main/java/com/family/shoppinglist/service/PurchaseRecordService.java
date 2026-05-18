package com.family.shoppinglist.service;

import com.family.shoppinglist.entity.PurchaseRecord;
import com.family.shoppinglist.repository.PurchaseRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class PurchaseRecordService {

    @Autowired
    private PurchaseRecordRepository purchaseRecordRepository;

    public List<PurchaseRecord> findByMonth(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        return purchaseRecordRepository.findByPurchaseDateBetweenOrderByPurchaseDateDesc(start, end);
    }

    public BigDecimal getMonthTotal(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        BigDecimal total = purchaseRecordRepository.findTotalAmountByDateRange(start, end);
        return total != null ? total : BigDecimal.ZERO;
    }

    public Map<String, BigDecimal> getCategorySummary(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1).minusDays(1);
        List<Object[]> results = purchaseRecordRepository.findCategorySummaryByDateRange(start, end);
        Map<String, BigDecimal> summary = new HashMap<>();
        for (Object[] row : results) {
            summary.put((String) row[0], (BigDecimal) row[1]);
        }
        return summary;
    }

    public PurchaseRecord save(PurchaseRecord record) {
        return purchaseRecordRepository.save(record);
    }

    public void delete(Long id) {
        purchaseRecordRepository.deleteById(id);
    }
}
