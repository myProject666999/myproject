package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.MaterialPurchase;
import com.construction.company.mapper.MaterialPurchaseMapper;
import com.construction.company.service.MaterialPurchaseService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialPurchaseServiceImpl extends ServiceImpl<MaterialPurchaseMapper, MaterialPurchase> implements MaterialPurchaseService {

    @Override
    public boolean save(MaterialPurchase materialPurchase) {
        return super.save(materialPurchase);
    }

    @Override
    public boolean updateById(MaterialPurchase materialPurchase) {
        return super.updateById(materialPurchase);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public MaterialPurchase getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<MaterialPurchase> list() {
        return super.list();
    }
}
