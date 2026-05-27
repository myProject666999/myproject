package com.wiki.knowledgebase.controller;

import com.wiki.knowledgebase.entity.Space;
import com.wiki.knowledgebase.entity.SpaceMember;
import com.wiki.knowledgebase.service.SpaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Tag(name = "空间管理", description = "知识空间的CRUD、成员管理等接口")
@RestController
@RequestMapping("/spaces")
@RequiredArgsConstructor
public class SpaceController {

    private final SpaceService spaceService;

    @Operation(summary = "获取公开空间列表")
    @GetMapping("/public")
    public ResponseEntity<Map<String, Object>> getPublicSpaces() {
        List<Space> spaces = spaceService.getPublicSpaces();
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", spaces);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取用户的空间列表")
    @GetMapping("/my")
    public ResponseEntity<Map<String, Object>> getUserSpaces(
            @RequestHeader(value = "userId", defaultValue = "1") Long userId) {
        List<Space> spaces = spaceService.getUserSpaces(userId);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", spaces);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取空间详情")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Optional<Space> space = spaceService.getById(id);
        Map<String, Object> result = new HashMap<>();
        if (space.isPresent()) {
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", space.get());
        } else {
            result.put("code", 404);
            result.put("message", "空间不存在");
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "创建空间")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Space space,
            @RequestHeader(value = "userId", defaultValue = "1") Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Space created = spaceService.createSpace(space, userId);
            result.put("code", 200);
            result.put("message", "创建成功");
            result.put("data", created);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "更新空间")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @RequestBody Space space) {
        Map<String, Object> result = new HashMap<>();
        try {
            Space updated = spaceService.updateSpace(id, space);
            result.put("code", 200);
            result.put("message", "更新成功");
            result.put("data", updated);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "删除空间")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            spaceService.deleteSpace(id);
            result.put("code", 200);
            result.put("message", "删除成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取空间成员列表")
    @GetMapping("/{id}/members")
    public ResponseEntity<Map<String, Object>> getMembers(@PathVariable Long id) {
        List<SpaceMember> members = spaceService.getMembers(id);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", members);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "添加空间成员")
    @PostMapping("/{id}/members")
    public ResponseEntity<Map<String, Object>> addMember(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "viewer") String role) {
        Map<String, Object> result = new HashMap<>();
        try {
            SpaceMember member = spaceService.addMember(id, userId, role);
            result.put("code", 200);
            result.put("message", "添加成功");
            result.put("data", member);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "移除空间成员")
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<Map<String, Object>> removeMember(
            @PathVariable Long id,
            @PathVariable Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            spaceService.removeMember(id, userId);
            result.put("code", 200);
            result.put("message", "移除成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }
}
