
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.Employee;
import com.beautyhair.entity.Store;
import com.beautyhair.mapper.EmployeeMapper;
import com.beautyhair.mapper.StoreMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeMapper employeeMapper;
    private final StoreMapper storeMapper;

    public PageResult<Employee> getEmployeePage(int page, int size, String keyword, Integer isTechnician, Integer status) {
        Page<Employee> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Employee> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Employee::getEmployeeName, keyword)
                    .or().like(Employee::getEmployeeNo, keyword)
                    .or().like(Employee::getPhone, keyword));
        }
        if (isTechnician != null) {
            wrapper.eq(Employee::getIsTechnician, isTechnician);
        }
        if (status != null) {
            wrapper.eq(Employee::getStatus, status);
        }
        wrapper.orderByDesc(Employee::getCreateTime);

        IPage<Employee> result = employeeMapper.selectPage(pageParam, wrapper);

        List<Employee> records = result.getRecords();
        for (Employee record : records) {
            if (record.getStoreId() != null) {
                Store store = storeMapper.selectById(record.getStoreId());
                if (store != null) {
                    record.setStoreName(store.getStoreName());
                }
            }
        }

        return new PageResult<>(records, result.getTotal());
    }

    public Employee getById(Long id) {
        return employeeMapper.selectById(id);
    }

    public List<Employee> getAll() {
        return employeeMapper.selectList(
                new LambdaQueryWrapper<Employee>().eq(Employee::getStatus, 1)
        );
    }

    public List<Employee> getTechnicians() {
        return employeeMapper.selectList(
                new LambdaQueryWrapper<Employee>()
                        .eq(Employee::getIsTechnician, 1)
                        .eq(Employee::getStatus, 1)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Employee employee) {
        if (StrUtil.isBlank(employee.getEmployeeNo())) {
            employee.setEmployeeNo("EMP" + System.currentTimeMillis());
        }
        if (employee.getStatus() == null) {
            employee.setStatus(1);
        }
        employeeMapper.insert(employee);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Employee employee) {
        employeeMapper.updateById(employee);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        employeeMapper.deleteById(id);
    }
}
