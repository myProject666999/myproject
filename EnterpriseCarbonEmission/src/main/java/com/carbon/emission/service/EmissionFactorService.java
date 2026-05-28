package com.carbon.emission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.EmissionFactor;
import com.carbon.emission.mapper.EmissionFactorMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmissionFactorService extends ServiceImpl<EmissionFactorMapper, EmissionFactor> {

    public List<EmissionFactor> getCurrentVersionFactors() {
        return list(new LambdaQueryWrapper<EmissionFactor>()
                .eq(EmissionFactor::getIsCurrent, 1)
                .eq(EmissionFactor::getStatus, 1));
    }

    public List<EmissionFactor> getFactorsByType(Integer factorType) {
        return list(new LambdaQueryWrapper<EmissionFactor>()
                .eq(EmissionFactor::getFactorType, factorType)
                .eq(EmissionFactor::getIsCurrent, 1)
                .eq(EmissionFactor::getStatus, 1));
    }

    public EmissionFactor getFactorByCodeAndVersion(String factorCode, String version) {
        return getOne(new LambdaQueryWrapper<EmissionFactor>()
                .eq(EmissionFactor::getFactorCode, factorCode)
                .eq(EmissionFactor::getVersion, version));
    }

    @Transactional(rollbackFor = Exception.class)
    public boolean addNewVersion(EmissionFactor factor) {
        lambdaUpdate()
                .eq(EmissionFactor::getFactorCode, factor.getFactorCode())
                .eq(EmissionFactor::getIsCurrent, 1)
                .set(EmissionFactor::getIsCurrent, 0)
                .update();
        factor.setIsCurrent(1);
        return save(factor);
    }
}
