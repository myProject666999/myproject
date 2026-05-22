package com.health.physical.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.health.physical.entity.AbnormalRule;
import com.health.physical.mapper.AbnormalRuleMapper;
import com.health.physical.service.AbnormalRuleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AbnormalRuleServiceImpl extends ServiceImpl<AbnormalRuleMapper, AbnormalRule> implements AbnormalRuleService {

    @Override
    public AbnormalRule getRuleByIndicatorName(String indicatorName) {
        QueryWrapper<AbnormalRule> wrapper = new QueryWrapper<>();
        wrapper.eq("indicator_name", indicatorName)
                .eq("is_active", 1)
                .last("LIMIT 1");
        return getOne(wrapper, false);
    }

    @Override
    public List<AbnormalRule> getActiveRules() {
        QueryWrapper<AbnormalRule> wrapper = new QueryWrapper<>();
        wrapper.eq("is_active", 1).orderByAsc("category_id");
        return list(wrapper);
    }
}
