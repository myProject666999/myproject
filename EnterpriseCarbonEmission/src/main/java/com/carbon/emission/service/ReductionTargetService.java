package com.carbon.emission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.ReductionTarget;
import com.carbon.emission.mapper.ReductionTargetMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class ReductionTargetService extends ServiceImpl<ReductionTargetMapper, ReductionTarget> {

    public Page<ReductionTarget> getTargetPage(Long orgId, Integer status, Integer pageNum, Integer pageSize) {
        LambdaQueryWrapper<ReductionTarget> wrapper = new LambdaQueryWrapper<>();
        if (orgId != null) {
            wrapper.eq(ReductionTarget::getOrgId, orgId);
        }
        if (status != null) {
            wrapper.eq(ReductionTarget::getStatus, status);
        }
        wrapper.orderByDesc(ReductionTarget::getCreateTime);
        return page(new Page<>(pageNum, pageSize), wrapper);
    }

    public List<ReductionTarget> getTargetsByOrg(Long orgId) {
        return list(new LambdaQueryWrapper<ReductionTarget>()
                .eq(ReductionTarget::getOrgId, orgId)
                .orderByDesc(ReductionTarget::getTargetYear));
    }

    public ReductionTarget updateTargetProgress(Long targetId, BigDecimal actualEmission) {
        ReductionTarget target = getById(targetId);
        if (target == null) {
            return null;
        }

        target.setActualEmission(actualEmission);
        
        BigDecimal reduction = target.getBaseEmission().subtract(actualEmission);
        BigDecimal actualRate = reduction.divide(target.getBaseEmission(), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        target.setActualReductionRate(actualRate);

        BigDecimal achievement = actualRate.divide(target.getTargetReductionRate(), 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
        target.setAchievementRate(achievement);

        updateById(target);
        return target;
    }

    @Override
    public boolean save(ReductionTarget entity) {
        if (entity.getTargetNo() == null || entity.getTargetNo().isEmpty()) {
            entity.setTargetNo("RT" + System.currentTimeMillis());
        }
        if (entity.getStatus() == null) {
            entity.setStatus(1);
        }
        return super.save(entity);
    }
}
