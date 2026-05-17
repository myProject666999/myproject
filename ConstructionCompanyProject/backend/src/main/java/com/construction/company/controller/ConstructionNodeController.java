package com.construction.company.controller;

import com.construction.company.common.Result;
import com.construction.company.entity.ConstructionNode;
import com.construction.company.service.ConstructionNodeService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Api(tags = "施工节点管理")
@RestController
@RequestMapping("/constructionNode")
public class ConstructionNodeController {

    @Autowired
    private ConstructionNodeService constructionNodeService;

    @ApiOperation("查询施工节点列表")
    @GetMapping("/list")
    public Result<List<ConstructionNode>> list() {
        return Result.success(constructionNodeService.list());
    }

    @ApiOperation("根据ID查询施工节点")
    @GetMapping("/{id}")
    public Result<ConstructionNode> getById(@PathVariable Long id) {
        return Result.success(constructionNodeService.getById(id));
    }

    @ApiOperation("新增施工节点")
    @PostMapping("/add")
    public Result<Boolean> add(@RequestBody ConstructionNode constructionNode) {
        return Result.success(constructionNodeService.save(constructionNode));
    }

    @ApiOperation("更新施工节点")
    @PutMapping("/update")
    public Result<Boolean> update(@RequestBody ConstructionNode constructionNode) {
        return Result.success(constructionNodeService.updateById(constructionNode));
    }

    @ApiOperation("删除施工节点")
    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(constructionNodeService.removeById(id));
    }
}
