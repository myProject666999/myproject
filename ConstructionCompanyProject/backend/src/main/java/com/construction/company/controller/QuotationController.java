package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.Quotation;
import com.construction.company.service.QuotationService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "报价单管理")
@RestController
@RequestMapping("/quotation")
public class QuotationController {

    @Autowired
    private QuotationService quotationService;

    @ApiOperation("查询报价单列表")
    @GetMapping("/list")
    public Result<List<Quotation>> list() {
        return Result.success(quotationService.list());
    }

    @ApiOperation("根据ID查询报价单")
    @GetMapping("/{id}")
    public Result<Quotation> getById(@PathVariable Long id) {
        return Result.success(quotationService.getById(id));
    }

    @ApiOperation("新增报价单")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody Quotation quotation) {
        return Result.success(quotationService.save(quotation));
    }

    @ApiOperation("更新报价单")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody Quotation quotation) {
        return Result.success(quotationService.updateById(quotation));
    }

    @ApiOperation("删除报价单")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(quotationService.removeById(id));
    }
}
