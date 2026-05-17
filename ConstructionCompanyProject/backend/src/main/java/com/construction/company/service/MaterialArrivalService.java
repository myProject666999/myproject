package com.construction.company.service;

import com.construction.company.entity.MaterialArrival;

import java.util.List;

public interface MaterialArrivalService {
    boolean save(MaterialArrival materialArrival);
    boolean updateById(MaterialArrival materialArrival);
    boolean removeById(Long id);
    MaterialArrival getById(Long id);
    List<MaterialArrival> list();
}
