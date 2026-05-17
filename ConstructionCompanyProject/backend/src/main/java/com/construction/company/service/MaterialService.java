package com.construction.company.service;

import com.construction.company.entity.Material;

import java.util.List;

public interface MaterialService {
    boolean save(Material material);
    boolean updateById(Material material);
    boolean removeById(Long id);
    Material getById(Long id);
    List<Material> list();
}
