package com.construction.company.service;

import com.construction.company.entity.Customer;

import java.util.List;

public interface CustomerService {
    boolean save(Customer customer);
    boolean updateById(Customer customer);
    boolean removeById(Long id);
    Customer getById(Long id);
    List<Customer> list();
}
