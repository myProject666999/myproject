package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.entity.Herb;
import com.tcm.system.service.HerbService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/herbs")
public class HerbController {

    @Autowired
    private HerbService herbService;

    @GetMapping
    public Result<List<Herb>> list(@RequestParam(required = false) String keyword,
                                   @RequestParam(required = false) String category) {
        return Result.success(herbService.list(keyword, category));
    }

    @GetMapping("/{id}")
    public Result<Herb> getById(@PathVariable Long id) {
        return Result.success(herbService.getById(id));
    }

    @GetMapping("/name/{name}")
    public Result<Herb> getByName(@PathVariable String name) {
        return Result.success(herbService.getByName(name));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody Herb herb) {
        return Result.success(herbService.save(herb));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody Herb herb) {
        return Result.success(herbService.update(herb));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(herbService.delete(id));
    }
}
