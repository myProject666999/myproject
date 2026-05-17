package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Customer;
import com.construction.company.mapper.CustomerMapper;
import com.construction.company.service.CustomerService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerServiceImpl extends ServiceImpl<CustomerMapper, Customer> implements CustomerService {

    @Override
    public boolean save(Customer customer) {
        return super.save(customer);
    }

    @Override
    public boolean updateById(Customer customer) {
        return super.updateById(customer);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Customer getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Customer> list() {
        return super.list();
    }
}
