package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.Material;
import com.construction.company.mapper.MaterialMapper;
import com.construction.company.service.MaterialService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialServiceImpl extends ServiceImpl<MaterialMapper, Material> implements MaterialService {

    @Override
    public boolean save(Material material) {
        return super.save(material);
    }

    @Override
    public boolean updateById(Material material) {
        return super.updateById(material);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public Material getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<Material> list() {
        return super.list();
    }
}
