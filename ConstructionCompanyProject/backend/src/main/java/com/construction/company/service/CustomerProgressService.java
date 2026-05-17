package com.construction.company.service;

import com.construction.company.entity.CustomerProgress;

import java.util.List;

public interface CustomerProgressService {
    boolean save(CustomerProgress customerProgress);
    boolean updateById(CustomerProgress customerProgress);
    boolean removeById(Long id);
    CustomerProgress getById(Long id);
    List<CustomerProgress> list();
}
