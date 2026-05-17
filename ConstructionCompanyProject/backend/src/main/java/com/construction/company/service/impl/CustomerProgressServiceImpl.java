package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.CustomerProgress;
import com.construction.company.mapper.CustomerProgressMapper;
import com.construction.company.service.CustomerProgressService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerProgressServiceImpl extends ServiceImpl<CustomerProgressMapper, CustomerProgress> implements CustomerProgressService {

    @Override
    public boolean save(CustomerProgress customerProgress) {
        return super.save(customerProgress);
    }

    @Override
    public boolean updateById(CustomerProgress customerProgress) {
        return super.updateById(customerProgress);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public CustomerProgress getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<CustomerProgress> list() {
        return super.list();
    }
}
