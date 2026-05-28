package com.carbon.emission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.EsgIndicator;
import com.carbon.emission.mapper.EsgIndicatorMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EsgIndicatorService extends ServiceImpl<EsgIndicatorMapper, EsgIndicator> {

    public List<EsgIndicator> getIndicatorsByDimension(Integer dimension) {
        return list(new LambdaQueryWrapper<EsgIndicator>()
                .eq(dimension != null, EsgIndicator::getDimension, dimension)
                .eq(EsgIndicator::getStatus, 1)
                .orderByAsc(EsgIndicator::getSortOrder));
    }

    public List<EsgIndicator> getAllIndicators() {
        return list(new LambdaQueryWrapper<EsgIndicator>()
                .eq(EsgIndicator::getStatus, 1)
                .orderByAsc(EsgIndicator::getDimension)
                .orderByAsc(EsgIndicator::getSortOrder));
    }
}
