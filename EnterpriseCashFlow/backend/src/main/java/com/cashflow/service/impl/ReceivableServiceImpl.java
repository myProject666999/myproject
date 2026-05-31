package com.cashflow.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.cashflow.entity.Receivable;
import com.cashflow.mapper.ReceivableMapper;
import com.cashflow.service.ReceivableService;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReceivableServiceImpl extends ServiceImpl<ReceivableMapper, Receivable> implements ReceivableService {

    @Override
    public IPage<Receivable> pageList(int current, int size, String keyword, Integer status) {
        Page<Receivable> page = new Page<>(current, size);
        LambdaQueryWrapper<Receivable> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.like(Receivable::getCounterparty, keyword)
                    .or().like(Receivable::getDescription, keyword);
        }
        if (status != null) {
            wrapper.eq(Receivable::getStatus, status);
        }
        wrapper.orderByAsc(Receivable::getDueDate);
        return this.page(page, wrapper);
    }

    @Override
    public List<Receivable> listByDueDateRange(Long companyId, LocalDate startDate, LocalDate endDate) {
        LambdaQueryWrapper<Receivable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Receivable::getCompanyId, companyId)
                .eq(Receivable::getStatus, 0)
                .ge(Receivable::getDueDate, startDate)
                .le(Receivable::getDueDate, endDate)
                .orderByAsc(Receivable::getDueDate);
        return this.list(wrapper);
    }

    @Override
    public Receivable addReceivable(Receivable receivable) {
        this.save(receivable);
        return receivable;
    }

    @Override
    public Receivable updateReceivable(Receivable receivable) {
        this.updateById(receivable);
        return receivable;
    }

    @Override
    public Long getTotalPending(Long companyId) {
        LambdaQueryWrapper<Receivable> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(Receivable::getCompanyId, companyId)
                .eq(Receivable::getStatus, 0);
        List<Receivable> list = this.list(wrapper);
        return list.stream().mapToLong(Receivable::getAmount).sum();
    }
}
