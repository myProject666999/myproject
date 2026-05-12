
package com.beautyhair.controller;

import com.beautyhair.common.PageResult;
import com.beautyhair.common.Result;
import com.beautyhair.entity.Member;
import com.beautyhair.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/member")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping("/page")
    public Result<PageResult<Member>> getMemberPage(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) Integer status) {
        PageResult<Member> result = memberService.getMemberPage(page, size, keyword, level, status);
        return Result.success(result);
    }

    @GetMapping("/{id}")
    public Result<Member> getById(@PathVariable Long id) {
        Member member = memberService.getById(id);
        return Result.success(member);
    }

    @GetMapping("/phone/{phone}")
    public Result<Member> getByPhone(@PathVariable String phone) {
        Member member = memberService.getByPhone(phone);
        return Result.success(member);
    }

    @PostMapping
    public Result<Void> add(@RequestBody Member member) {
        memberService.add(member);
        return Result.success("新增成功");
    }

    @PutMapping
    public Result<Void> update(@RequestBody Member member) {
        memberService.update(member);
        return Result.success("更新成功");
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        memberService.delete(id);
        return Result.success("删除成功");
    }

    @GetMapping("/statistics")
    public Result<Map<String, Object>> getStatistics() {
        return Result.success(memberService.getMemberStatistics());
    }
}
