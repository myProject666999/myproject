package com.construction.company.service;

import com.construction.company.entity.MaterialPurchase;

import java.util.List;

public interface MaterialPurchaseService {
    boolean save(MaterialPurchase materialPurchase);
    boolean updateById(MaterialPurchase materialPurchase);
    boolean removeById(Long id);
    MaterialPurchase getById(Long id);
    List<MaterialPurchase> list();
}
