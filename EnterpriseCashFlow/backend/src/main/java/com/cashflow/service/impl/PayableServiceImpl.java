package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.Payable;
import com.cashflow.mapper.PayableMapper;
import com.cashflow.service.PayableService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

@Service
public class PayableServiceImpl extends ServiceImpl<PayableMapper, Payable> implements PayableService {

    @Override
    public IPage<Payable> pageList(int current, int size, String keyword, Integer status) {
        Page<Payable> page = new Page<>(current, size);
        LambdaQueryWrapper<Payable> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Payable::getCounterparty, keyword)
                    .or().like(Payable::getDescription, keyword);
        }
        if (status != null) {
            wrapper.eq(Payable::getStatus, status);
        }
        wrapper.orderByAsc(Payable::getDueDate);
        return this.page(page, wrapper);
    }

    @Override
    public List<Payable> listByDueDateRange(Long companyId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<Payable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Payable::getCompanyId, companyId)
                .eq(Payable::getStatus, 0)
                .ge(Payable::getDueDate, startDate)
                .le(Payable::getDueDate, endDate)
                .orderByAsc(Payable::getDueDate);
        return this.list(wrapper);
    }

    @Override
    public Payable addPayable(Payable payable) {
        this.save(payable);
        return payable;
    }

    @Override
    public Payable updatePayable(Payable payable) {
        this.updateById(payable);
        return payable;
    }

    @Override
    public Long getTotalPending(Long companyId) {
        LambdaQueryWrapper<Payable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Payable::getCompanyId, companyId)
                .eq(Payable::getStatus, 0);
        List<Payable> list = this.list(wrapper);
        return list.stream().mapToLong(Payable::getAmount).sum();
    }
}
