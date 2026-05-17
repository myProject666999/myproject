package com.construction.company.service;

import com.construction.company.entity.Warranty;

import java.util.List;

public interface WarrantyService {
    boolean save(Warranty warranty);
    boolean updateById(Warranty warranty);
    boolean removeById(Long id);
    Warranty getById(Long id);
    List<Warranty> list();
}
