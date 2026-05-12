
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.Store;
import com.beautyhair.mapper.StoreMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final StoreMapper storeMapper;

    public PageResult<Store> getStorePage(int page, int size, String keyword, Integer status) {
        Page<Store> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Store> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Store::getStoreName, keyword)
                    .or().like(Store::getStoreCode, keyword)
                    .or().like(Store::getPhone, keyword));
        }
        if (status != null) {
            wrapper.eq(Store::getStatus, status);
        }
        wrapper.orderByDesc(Store::getCreateTime);

        IPage<Store> result = storeMapper.selectPage(pageParam, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public Store getById(Long id) {
        return storeMapper.selectById(id);
    }

    public List<Store> getAll() {
        return storeMapper.selectList(
                new LambdaQueryWrapper<Store>().eq(Store::getStatus, 1)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Store store) {
        if (StrUtil.isBlank(store.getStoreCode())) {
            store.setStoreCode("ST" + System.currentTimeMillis());
        }
        if (store.getStatus() == null) {
            store.setStatus(1);
        }
        storeMapper.insert(store);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Store store) {
        storeMapper.updateById(store);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        storeMapper.deleteById(id);
    }
}
