package com.fmr.controller;

import com.fmr.common.Result;
import com.fmr.entity.Allergy;
import com.fmr.service.AllergyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/allergies")
public class AllergyController {

    @Autowired
    private AllergyService allergyService;

    @GetMapping
    public Result<List<Allergy>> list(@RequestParam(required = false) Long memberId) {
        if (memberId != null) {
            return Result.ok(allergyService.listByMemberId(memberId));
        }
        return Result.ok(allergyService.list());
    }

    @PostMapping
    public Result<String> create(@RequestBody Allergy allergy) {
        allergyService.save(allergy);
        return Result.ok("创建成功");
    }

    @PutMapping("/{id}")
    public Result<String> update(@PathVariable Long id, @RequestBody Allergy allergy) {
        allergy.setId(id);
        allergyService.updateById(allergy);
        return Result.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        allergyService.removeById(id);
        return Result.ok("删除成功");
    }
}
