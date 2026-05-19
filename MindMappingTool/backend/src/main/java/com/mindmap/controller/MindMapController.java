package com.mindmap.controller;

import com.mindmap.common.Result;
import com.mindmap.entity.MindMap;
import com.mindmap.service.MindMapService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mindmap")
@CrossOrigin(origins = "*")
public class MindMapController {

    @Autowired
    private MindMapService mindMapService;

    @GetMapping("/list")
    public Result<List<MindMap>> list(@RequestParam Long userId) {
        return Result.success(mindMapService.listByUserId(userId));
    }

    @GetMapping("/{id}")
    public Result<MindMap> detail(@PathVariable Long id) {
        return Result.success(mindMapService.getDetail(id));
    }

    @PostMapping
    public Result<MindMap> save(@RequestBody MindMap mindMap) {
        mindMapService.saveMindMap(mindMap);
        return Result.success(mindMap);
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody MindMap mindMap) {
        return Result.success(mindMapService.updateMindMap(mindMap));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(mindMapService.deleteMindMap(id));
    }
}
