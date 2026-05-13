package com.chess.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.chess.common.Result;
import com.chess.entity.Member;
import com.chess.mapper.MemberMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin
public class MemberController {

    @Autowired
    private MemberMapper memberMapper;

    @GetMapping
    public Result<List<Member>> list() {
        LambdaQueryWrapper<Member> wrapper = new LambdaQueryWrapper<>();
        wrapper.orderByDesc(Member::getCreateTime);
        return Result.success(memberMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Member> getById(@PathVariable Long id) {
        return Result.success(memberMapper.selectById(id));
    }

    @GetMapping("/search")
    public Result<Member> search(@RequestParam(required = false) String keyword) {
        if (keyword == null || keyword.isEmpty()) {
            return Result.success(null);
        }
        LambdaQueryWrapper<Member> wrapper = new LambdaQueryWrapper<>();
        wrapper.and(w -> w.eq(Member::getMemberNo, keyword).or().like(Member::getPhone, keyword));
        wrapper.eq(Member::getStatus, 1);
        wrapper.last("LIMIT 1");
        return Result.success(memberMapper.selectOne(wrapper));
    }

    @PostMapping
    public Result<Integer> add(@RequestBody Member member) {
        return Result.success(memberMapper.insert(member));
    }

    @PutMapping
    public Result<Integer> update(@RequestBody Member member) {
        return Result.success(memberMapper.updateById(member));
    }

    @DeleteMapping("/{id}")
    public Result<Integer> delete(@PathVariable Long id) {
        return Result.success(memberMapper.deleteById(id));
    }
}
