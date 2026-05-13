package com.court.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.court.reservation.common.Result;
import com.court.reservation.entity.Court;
import com.court.reservation.mapper.CourtMapper;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/court")
public class CourtController {

    @Resource
    private CourtMapper courtMapper;

    @GetMapping("/list")
    public Result<List<Court>> list(@RequestParam(required = false) String type) {
        QueryWrapper<Court> wrapper = new QueryWrapper<>();
        if (type != null && !type.isEmpty()) {
            wrapper.eq("type", type);
        }
        wrapper.orderByAsc("court_no");
        return Result.success(courtMapper.selectList(wrapper));
    }

    @GetMapping("/{id}")
    public Result<Court> getById(@PathVariable Long id) {
        return Result.success(courtMapper.selectById(id));
    }

    @PostMapping
    public Result<Court> create(@RequestBody Court court) {
        court.setCreateTime(LocalDateTime.now());
        court.setUpdateTime(LocalDateTime.now());
        courtMapper.insert(court);
        return Result.success(court);
    }

    @PutMapping("/{id}")
    public Result<Court> update(@PathVariable Long id, @RequestBody Court court) {
        court.setId(id);
        court.setUpdateTime(LocalDateTime.now());
        courtMapper.updateById(court);
        return Result.success(court);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        courtMapper.deleteById(id);
        return Result.success();
    }
}