package com.carbon.emission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.EsgIndicatorData;
import com.carbon.emission.mapper.EsgIndicatorDataMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EsgIndicatorDataService extends ServiceImpl<EsgIndicatorDataMapper, EsgIndicatorData> {

    public List<EsgIndicatorData> getIndicatorDataByPeriod(Long orgId, Integer periodType, String periodValue) {
        return list(new LambdaQueryWrapper<EsgIndicatorData>()
                .eq(orgId != null, EsgIndicatorData::getOrgId, orgId)
                .eq(EsgIndicatorData::getPeriodType, periodType)
                .eq(EsgIndicatorData::getPeriodValue, periodValue)
                .eq(EsgIndicatorData::getStatus, 1));
    }

    public Page<EsgIndicatorData> getDataPage(Long orgId, Long indicatorId, Integer periodType, 
                                               String periodValue, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<EsgIndicatorData> wrapper = new LambdaQueryWrapper<>();
        if (orgId != null) {
            wrapper.eq(EsgIndicatorData::getOrgId, orgId);
        }
        if (indicatorId != null) {
            wrapper.eq(EsgIndicatorData::getIndicatorId, indicatorId);
        }
        if (periodType != null) {
            wrapper.eq(EsgIndicatorData::getPeriodType, periodType);
        }
        if (periodValue != null) {
            wrapper.eq(EsgIndicatorData::getPeriodValue, periodValue);
        }
        wrapper.orderByDesc(EsgIndicatorData::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }
}
