package com.paper.controller;

import com.paper.dto.*;
import com.paper.service.PaperService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/papers")
public class PaperController {

    @Autowired
    private PaperService paperService;

    @GetMapping
    public ApiResponse<Page<PaperDTO>> findAll(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long tagId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        Sort.Direction direction = sort[1].equalsIgnoreCase("desc") ? 
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sort[0]));
        return ApiResponse.success(paperService.findAll(keyword, tagId, pageable));
    }

    @GetMapping("/{id}")
    public ApiResponse<PaperDetailDTO> findById(@PathVariable Long id) {
        return ApiResponse.success(paperService.findById(id));
    }

    @PostMapping
    public ApiResponse<PaperDTO> create(@Valid @RequestBody PaperRequest request) {
        return ApiResponse.success("创建成功", paperService.create(request));
    }

    @PostMapping("/upload")
    public ApiResponse<PaperDTO> uploadPdf(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("文件不能为空");
        }
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".pdf")) {
            throw new RuntimeException("请上传PDF文件");
        }
        return ApiResponse.success("上传成功", paperService.uploadPdf(file));
    }

    @PutMapping("/{id}")
    public ApiResponse<PaperDTO> update(@PathVariable Long id, @Valid @RequestBody PaperRequest request) {
        return ApiResponse.success("更新成功", paperService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        paperService.delete(id);
        return ApiResponse.success("删除成功", null);
    }

    @GetMapping("/{id}/bibtex")
    public ResponseEntity<String> exportBibTeX(@PathVariable Long id) {
        String bibtex = paperService.exportBibTeX(id);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.TEXT_PLAIN);
        headers.setContentDispositionFormData("attachment", "reference.bib");
        return ResponseEntity.ok()
                .headers(headers)
                .body(bibtex);
    }

    @PostMapping("/bibtex/export")
    public ResponseEntity<String> exportMultipleBibTeX(@RequestBody List<Long> ids) {
        String bibtex = paperService.exportMultipleBibTeX(ids);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(new MediaType("text", "plain", StandardCharsets.UTF_8));
        headers.setContentDispositionFormData("attachment", "references.bib");
        return ResponseEntity.ok()
                .headers(headers)
                .body(bibtex);
    }
}
