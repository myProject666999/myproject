
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.ServiceCategory;
import com.beautyhair.entity.ServiceItem;
import com.beautyhair.mapper.ServiceCategoryMapper;
import com.beautyhair.mapper.ServiceItemMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceItemService {

    private final ServiceItemMapper serviceItemMapper;
    private final ServiceCategoryMapper serviceCategoryMapper;

    public PageResult<ServiceItem> getServiceItemPage(int page, int size, String keyword, Long categoryId, Integer status) {
        Page<ServiceItem> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<ServiceItem> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(ServiceItem::getItemName, keyword)
                    .or().like(ServiceItem::getItemCode, keyword));
        }
        if (categoryId != null) {
            wrapper.eq(ServiceItem::getCategoryId, categoryId);
        }
        if (status != null) {
            wrapper.eq(ServiceItem::getStatus, status);
        }
        wrapper.orderByAsc(ServiceItem::getSort)
                .orderByDesc(ServiceItem::getCreateTime);

        IPage<ServiceItem> result = serviceItemMapper.selectPage(pageParam, wrapper);

        List<ServiceItem> records = result.getRecords();
        for (ServiceItem record : records) {
            if (record.getCategoryId() != null) {
                ServiceCategory category = serviceCategoryMapper.selectById(record.getCategoryId());
                if (category != null) {
                    record.setCategoryName(category.getCategoryName());
                }
            }
        }

        return new PageResult<>(records, result.getTotal());
    }

    public ServiceItem getById(Long id) {
        return serviceItemMapper.selectById(id);
    }

    public List<ServiceItem> getAll() {
        return serviceItemMapper.selectList(
                new LambdaQueryWrapper<ServiceItem>()
                        .eq(ServiceItem::getStatus, 1)
                        .orderByAsc(ServiceItem::getSort)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(ServiceItem serviceItem) {
        if (StrUtil.isBlank(serviceItem.getItemCode())) {
            serviceItem.setItemCode("SVC" + System.currentTimeMillis());
        }
        if (serviceItem.getStatus() == null) {
            serviceItem.setStatus(1);
        }
        if (serviceItem.getSort() == null) {
            serviceItem.setSort(0);
        }
        serviceItemMapper.insert(serviceItem);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(ServiceItem serviceItem) {
        serviceItemMapper.updateById(serviceItem);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        serviceItemMapper.deleteById(id);
    }
}
