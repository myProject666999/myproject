
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.Product;
import com.beautyhair.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/product")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/page")
    public Result<PageResult<Product>> getProductPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer status) {
        PageResult<Product> result = productService.getProductPage(page, size, keyword, category, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Product> getById(@PathVariable Long id) {
        Product product = productService.getById(id);
        return Result.success(product);
    }

    @GetMapping("/all")
    public Result<List<Product>> getAll() {
        List<Product> products = productService.getAll();
        return Result.success(products);
    }

    @PostMapping
    public Result<Void> add(@RequestBody Product product) {
        productService.add(product);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody Product product) {
        productService.update(product);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return Result.success("删除成功");
    }
}
