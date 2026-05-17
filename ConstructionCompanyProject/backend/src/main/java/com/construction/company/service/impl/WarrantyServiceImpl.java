package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Warranty;
import com.construction.company.mapper.WarrantyMapper;
import com.construction.company.service.WarrantyService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WarrantyServiceImpl extends ServiceImpl<WarrantyMapper, Warranty> implements WarrantyService {

    @Override
    public boolean save(Warranty warranty) {
        return super.save(warranty);
    }

    @Override
    public boolean updateById(Warranty warranty) {
        return super.updateById(warranty);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Warranty getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Warranty> list() {
        return super.list();
    }
}
