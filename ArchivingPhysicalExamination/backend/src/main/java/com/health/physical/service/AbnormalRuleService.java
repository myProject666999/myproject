package com.health.physical.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.health.physical.entity.AbnormalRule;
import java.util.List;

public interface AbnormalRuleService extends IService<AbnormalRule> {

    AbnormalRule getRuleByIndicatorName(String indicatorName);

    List<AbnormalRule> getActiveRules();
}
