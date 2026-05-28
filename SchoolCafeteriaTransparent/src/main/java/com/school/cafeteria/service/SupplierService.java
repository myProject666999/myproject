package com.school.cafeteria.service;

import com.school.cafeteria.entity.Supplier;
import com.school.cafeteria.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SupplierService {

    @Autowired
    private SupplierRepository supplierRepository;

    public Supplier save(Supplier supplier) {
        return supplierRepository.save(supplier);
    }

    public Optional<Supplier> findById(Long id) {
        return supplierRepository.findById(id);
    }

    public List<Supplier> findAll() {
        return supplierRepository.findAll();
    }

    public List<Supplier> findActive() {
        return supplierRepository.findByStatus(1);
    }

    public List<Supplier> searchByName(String keyword) {
        return supplierRepository.findBySupplierNameContaining(keyword);
    }

    public void delete(Long id) {
        supplierRepository.deleteById(id);
    }
}
