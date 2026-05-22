package com.fmr.controller;

import com.fmr.common.Result;
import com.fmr.entity.FamilyMember;
import com.fmr.service.FamilyMemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
public class FamilyMemberController {

    @Autowired
    private FamilyMemberService familyMemberService;

    @GetMapping
    public Result<List<FamilyMember>> list() {
        return Result.ok(familyMemberService.listAll());
    }

    @GetMapping("/{id}")
    public Result<FamilyMember> getById(@PathVariable Long id) {
        FamilyMember m = familyMemberService.getMemberById(id);
        if (m == null) return Result.fail("成员不存在");
        return Result.ok(m);
    }

    @PostMapping
    public Result<String> create(@RequestBody FamilyMember member) {
        familyMemberService.saveMember(member);
        return Result.ok("创建成功");
    }

    @PutMapping("/{id}")
    public Result<String> update(@PathVariable Long id, @RequestBody FamilyMember member) {
        member.setId(id);
        familyMemberService.updateMember(member);
        return Result.ok("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        familyMemberService.removeMember(id);
        return Result.ok("删除成功");
    }
}
