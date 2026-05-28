package com.school.cafeteria.service;

import com.school.cafeteria.entity.IngredientTrace;
import com.school.cafeteria.entity.Supplier;
import com.school.cafeteria.repository.IngredientTraceRepository;
import com.school.cafeteria.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class IngredientTraceService {

    @Autowired
    private IngredientTraceRepository ingredientTraceRepository;

    @Autowired
    private SupplierRepository supplierRepository;

    public IngredientTrace save(IngredientTrace trace) {
        if (trace.getBatchNo() == null || trace.getBatchNo().isEmpty()) {
            trace.setBatchNo(generateBatchNo());
        }
        return ingredientTraceRepository.save(trace);
    }

    private String generateBatchNo() {
        return "ING" + System.currentTimeMillis();
    }

    public Optional<IngredientTrace> findById(Long id) {
        Optional<IngredientTrace> trace = ingredientTraceRepository.findById(id);
        trace.ifPresent(this::loadSupplierName);
        return trace;
    }

    public Optional<IngredientTrace> findByBatchNo(String batchNo) {
        Optional<IngredientTrace> trace = ingredientTraceRepository.findByBatchNo(batchNo);
        trace.ifPresent(this::loadSupplierName);
        return trace;
    }

    public List<IngredientTrace> findByDateRange(LocalDate startDate, LocalDate endDate) {
        List<IngredientTrace> traces = ingredientTraceRepository.findByPurchaseDateRange(startDate, endDate);
        traces.forEach(this::loadSupplierName);
        return traces;
    }

    public List<IngredientTrace> findBySupplierId(Long supplierId) {
        return ingredientTraceRepository.findBySupplierId(supplierId);
    }

    public List<IngredientTrace> searchByIngredientName(String keyword) {
        List<IngredientTrace> traces = ingredientTraceRepository.findByIngredientNameContaining(keyword);
        traces.forEach(this::loadSupplierName);
        return traces;
    }

    public List<IngredientTrace> findAll() {
        List<IngredientTrace> traces = ingredientTraceRepository.findAll();
        traces.forEach(this::loadSupplierName);
        return traces;
    }

    public void delete(Long id) {
        ingredientTraceRepository.deleteById(id);
    }

    private void loadSupplierName(IngredientTrace trace) {
        if (trace.getSupplierId() != null) {
            Optional<Supplier> supplier = supplierRepository.findById(trace.getSupplierId());
            supplier.ifPresent(s -> trace.setSupplierName(s.getSupplierName()));
        }
    }
}
