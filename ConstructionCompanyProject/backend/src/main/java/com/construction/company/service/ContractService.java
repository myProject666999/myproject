package com.construction.company.service;

import com.construction.company.entity.Contract;

import java.util.List;

public interface ContractService {
    boolean save(Contract contract);
    boolean updateById(Contract contract);
    boolean removeById(Long id);
    Contract getById(Long id);
    List<Contract> list();
}
