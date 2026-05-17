package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Contract;
import com.construction.company.mapper.ContractMapper;
import com.construction.company.service.ContractService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ContractServiceImpl extends ServiceImpl<ContractMapper, Contract> implements ContractService {

    @Override
    public boolean save(Contract contract) {
        return super.save(contract);
    }

    @Override
    public boolean updateById(Contract contract) {
        return super.updateById(contract);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Contract getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Contract> list() {
        return super.list();
    }
}
