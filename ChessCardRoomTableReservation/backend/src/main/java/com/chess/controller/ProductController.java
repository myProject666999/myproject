package com.chess.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chess.common.Result;
import com.chess.entity.Product;
import com.chess.mapper.ProductMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin
public class ProductController {

    @Autowired
    private ProductMapper productMapper;

    @GetMapping
    public Result<List<Product>> list(@RequestParam(required = false) String category) {
        LambdaQueryWrapper<Product> wrapper = new LambdaQueryWrapper<>();
        if (category != null && !category.isEmpty()) {
            wrapper.eq(Product::getCategory, category);
        }
        wrapper.eq(Product::getStatus, 1);
        wrapper.orderByAsc(Product::getCategory, Product::getName);
        return Result.success(productMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        return Result.success(productMapper.selectById(id));
    }

    @PostMapping
    public Result<Integer> add(@RequestBody Product product) {
        return Result.success(productMapper.insert(product));
    }

    @PutMapping
    public Result<Integer> update(@RequestBody Product product) {
        return Result.success(productMapper.updateById(product));
    }

    @DeleteMapping("/{id}")
    public Result<Integer> delete(@PathVariable Long id) {
        return Result.success(productMapper.deleteById(id));
    }
}
