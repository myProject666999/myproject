package com.wiki.knowledgebase.controller;

import com.wiki.knowledgebase.entity.Document;
import com.wiki.knowledgebase.entity.DocumentVersion;
import com.wiki.knowledgebase.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Tag(name = "文档管理", description = "文档的CRUD、版本管理、搜索等接口")
@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @Operation(summary = "获取文档树")
    @GetMapping("/tree/{spaceId}")
    public ResponseEntity<Map<String, Object>> getDocumentTree(@PathVariable Long spaceId) {
        List<Document> documents = documentService.getDocumentTree(spaceId);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", documents);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取子文档列表")
    @GetMapping("/children/{spaceId}")
    public ResponseEntity<Map<String, Object>> getChildren(
            @PathVariable Long spaceId,
            @RequestParam(required = false) Long parentId) {
        List<Document> children = documentService.getChildren(spaceId, parentId);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", children);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取文档详情")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        Optional<Document> document = documentService.getById(id);
        Map<String, Object> result = new HashMap<>();
        if (document.isPresent()) {
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", document.get());
        } else {
            result.put("code", 404);
            result.put("message", "文档不存在");
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "创建文档")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(
            @RequestBody Document document,
            @RequestHeader(value = "userId", defaultValue = "1") Long userId) {
        Map<String, Object> result = new HashMap<>();
        try {
            Document created = documentService.createDocument(document, userId);
            result.put("code", 200);
            result.put("message", "创建成功");
            result.put("data", created);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "更新文档")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @RequestBody Document document,
            @RequestHeader(value = "userId", defaultValue = "1") Long userId,
            @RequestParam(required = false) String editSummary) {
        Map<String, Object> result = new HashMap<>();
        try {
            Document updated = documentService.updateDocument(id, document, userId, editSummary);
            result.put("code", 200);
            result.put("message", "更新成功");
            result.put("data", updated);
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "删除文档（移入回收站）")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            documentService.deleteDocument(id);
            result.put("code", 200);
            result.put("message", "删除成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "恢复文档")
    @PostMapping("/{id}/restore")
    public ResponseEntity<Map<String, Object>> restore(@PathVariable Long id) {
        Map<String, Object> result = new HashMap<>();
        try {
            documentService.restoreDocument(id);
            result.put("code", 200);
            result.put("message", "恢复成功");
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", e.getMessage());
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "搜索文档")
    @GetMapping("/search")
    public ResponseEntity<Map<String, Object>> search(@RequestParam String keyword) {
        List<Document> documents = documentService.search(keyword);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", documents);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取文档版本列表")
    @GetMapping("/{id}/versions")
    public ResponseEntity<Map<String, Object>> getVersions(@PathVariable Long id) {
        List<DocumentVersion> versions = documentService.getVersions(id);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", versions);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取指定版本详情")
    @GetMapping("/{id}/versions/{version}")
    public ResponseEntity<Map<String, Object>> getVersion(
            @PathVariable Long id,
            @PathVariable Integer version) {
        Optional<DocumentVersion> documentVersion = documentService.getVersion(id, version);
        Map<String, Object> result = new HashMap<>();
        if (documentVersion.isPresent()) {
            result.put("code", 200);
            result.put("message", "success");
            result.put("data", documentVersion.get());
        } else {
            result.put("code", 404);
            result.put("message", "版本不存在");
        }
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "获取回收站文档列表")
    @GetMapping("/recycle/{spaceId}")
    public ResponseEntity<Map<String, Object>> getRecycled(@PathVariable Long spaceId) {
        List<Document> documents = documentService.getRecycledDocuments(spaceId);
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("message", "success");
        result.put("data", documents);
        return ResponseEntity.ok(result);
    }
}
