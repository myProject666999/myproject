package com.fmr.controller;

import com.fmr.common.Result;
import com.fmr.entity.VisitRecord;
import com.fmr.service.VisitRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/visits")
public class VisitRecordController {

    @Autowired
    private VisitRecordService visitRecordService;

    @GetMapping
    public Result<List<VisitRecord>> list(@RequestParam(required = false) Long memberId) {
        if (memberId != null) {
            return Result.ok(visitRecordService.listByMemberId(memberId));
        }
        return Result.ok(visitRecordService.list());
    }

    @GetMapping("/{id}")
    public Result<VisitRecord> getById(@PathVariable Long id) {
        VisitRecord v = visitRecordService.getVisitById(id);
        if (v == null) return Result.fail("记录不存在");
        return Result.ok(v);
    }

    @PostMapping
    public Result<String> create(@RequestBody VisitRecord visit) {
        visitRecordService.saveVisit(visit);
        return Result.ok("创建成功");
    }

    @PutMapping("/{id}")
    public Result<String> update(@PathVariable Long id, @RequestBody VisitRecord visit) {
        visit.setId(id);
        visitRecordService.updateVisit(visit);
        return Result.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        visitRecordService.removeVisit(id);
        return Result.ok("删除成功");
    }
}
