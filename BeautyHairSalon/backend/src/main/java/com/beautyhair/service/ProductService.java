
package com.beautyhair.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.beautyhair.common.PageResult;
import com.beautyhair.entity.Product;
import com.beautyhair.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductMapper productMapper;

    public PageResult<Product> getProductPage(int page, int size, String keyword, String category, Integer status) {
        Page<Product> pageParam = new Page<>(page, size);
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();

        if (StrUtil.isNotBlank(keyword)) {
            wrapper.and(w -> w.like(Product::getProductName, keyword)
                    .or().like(Product::getProductCode, keyword));
        }
        if (StrUtil.isNotBlank(category)) {
            wrapper.eq(Product::getCategory, category);
        }
        if (status != null) {
            wrapper.eq(Product::getStatus, status);
        }
        wrapper.orderByDesc(Product::getCreateTime);

        IPage<Product> result = productMapper.selectPage(pageParam, wrapper);
        return new PageResult<>(result.getRecords(), result.getTotal());
    }

    public Product getById(Long id) {
        return productMapper.selectById(id);
    }

    public List<Product> getAll() {
        return productMapper.selectList(
                new LambdaQueryWrapper<Product>().eq(Product::getStatus, 1)
        );
    }

    @Transactional(rollbackFor = Exception.class)
    public void add(Product product) {
        if (StrUtil.isBlank(product.getProductCode())) {
            product.setProductCode("PRO" + System.currentTimeMillis());
        }
        if (product.getStatus() == null) {
            product.setStatus(1);
        }
        if (product.getStock() == null) {
            product.setStock(0);
        }
        if (product.getSafetyStock() == null) {
            product.setSafetyStock(0);
        }
        productMapper.insert(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Product product) {
        productMapper.updateById(product);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        productMapper.deleteById(id);
    }
}
