package com.fmr.controller;

import com.fmr.common.Result;
import com.fmr.entity.FamilyHistory;
import com.fmr.service.FamilyHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/family-histories")
public class FamilyHistoryController {

    @Autowired
    private FamilyHistoryService familyHistoryService;

    @GetMapping
    public Result<List<FamilyHistory>> list(@RequestParam(required = false) Long memberId) {
        if (memberId != null) {
            return Result.ok(familyHistoryService.listByMemberId(memberId));
        }
        return Result.ok(familyHistoryService.list());
    }

    @PostMapping
    public Result<String> create(@RequestBody FamilyHistory history) {
        familyHistoryService.saveHistory(history);
        return Result.ok("创建成功");
    }

    @PutMapping("/{id}")
    public Result<String> update(@PathVariable Long id, @RequestBody FamilyHistory history) {
        history.setId(id);
        familyHistoryService.updateById(history);
        return Result.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        familyHistoryService.removeById(id);
        return Result.ok("删除成功");
    }
}
