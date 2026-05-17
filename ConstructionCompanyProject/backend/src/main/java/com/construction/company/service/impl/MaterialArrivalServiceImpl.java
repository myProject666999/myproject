package com.construction.company.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.construction.company.entity.MaterialArrival;
import com.construction.company.mapper.MaterialArrivalMapper;
import com.construction.company.service.MaterialArrivalService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MaterialArrivalServiceImpl extends ServiceImpl<MaterialArrivalMapper, MaterialArrival> implements MaterialArrivalService {

    @Override
    public boolean save(MaterialArrival materialArrival) {
        return super.save(materialArrival);
    }

    @Override
    public boolean updateById(MaterialArrival materialArrival) {
        return super.updateById(materialArrival);
    }

    @Override
    public boolean removeById(Long id) {
        return super.removeById(id);
    }

    @Override
    public MaterialArrival getById(Long id) {
        return super.getById(id);
    }

    @Override
    public List<MaterialArrival> list() {
        return super.list();
    }
}
