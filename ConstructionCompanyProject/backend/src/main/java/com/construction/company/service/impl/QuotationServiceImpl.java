package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Quotation;
import com.construction.company.mapper.QuotationMapper;
import com.construction.company.service.QuotationService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuotationServiceImpl extends ServiceImpl<QuotationMapper, Quotation> implements QuotationService {

    @Override
    public boolean save(Quotation quotation) {
        return super.save(quotation);
    }

    @Override
    public boolean updateById(Quotation quotation) {
        return super.updateById(quotation);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Quotation getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Quotation> list() {
        return super.list();
    }
}
