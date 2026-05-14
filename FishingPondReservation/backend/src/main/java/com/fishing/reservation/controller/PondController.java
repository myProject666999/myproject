package com.fishing.reservation.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.fishing.reservation.common.Result;
import com.fishing.reservation.entity.Pond;
import com.fishing.reservation.mapper.PondMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pond")
public class PondController {

    @Autowired
    private PondMapper pondMapper;

    @GetMapping("/list")
    public Result<List<Pond>> list() {
        List<Pond> ponds = pondMapper.selectList(
            new LambdaQueryWrapper<Pond>().eq(Pond::getStatus, 1)
        );
        return Result.success(ponds);
    }

    @GetMapping("/{id}")
    public Result<Pond> detail(@PathVariable Long id) {
        Pond pond = pondMapper.selectById(id);
        if (pond == null) {
            return Result.error("塘位不存在");
        }
        return Result.success(pond);
    }

    @PostMapping
    public Result<Pond> create(@RequestBody Pond pond) {
        pond.setStatus(1);
        pondMapper.insert(pond);
        return Result.success("创建成功", pond);
    }

    @PutMapping("/{id}")
    public Result<Pond> update(@PathVariable Long id, @RequestBody Pond pond) {
        pond.setId(id);
        pondMapper.updateById(pond);
        return Result.success("更新成功", pond);
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        pondMapper.deleteById(id);
        return Result.success(null);
    }
}
