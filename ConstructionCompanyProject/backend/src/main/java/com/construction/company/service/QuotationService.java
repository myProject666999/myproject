package com.construction.company.service;

import com.construction.company.entity.Quotation;

import java.util.List;

public interface QuotationService {
    boolean save(Quotation quotation);
    boolean updateById(Quotation quotation);
    boolean removeById(Long id);
    Quotation getById(Long id);
    List<Quotation> list();
}
