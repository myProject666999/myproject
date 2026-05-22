package com.health.physical.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.health.physical.entity.IndicatorCategory;
import java.util.List;

public interface IndicatorCategoryService extends IService<IndicatorCategory> {

    List<IndicatorCategory> getAllCategories();
}
