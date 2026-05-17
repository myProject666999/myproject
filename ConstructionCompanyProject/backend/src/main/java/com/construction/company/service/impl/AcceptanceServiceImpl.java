package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Acceptance;
import com.construction.company.mapper.AcceptanceMapper;
import com.construction.company.service.AcceptanceService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AcceptanceServiceImpl extends ServiceImpl<AcceptanceMapper, Acceptance> implements AcceptanceService {

    @Override
    public boolean save(Acceptance acceptance) {
        return super.save(acceptance);
    }

    @Override
    public boolean updateById(Acceptance acceptance) {
        return super.updateById(acceptance);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Acceptance getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Acceptance> list() {
        return super.list();
    }
}
