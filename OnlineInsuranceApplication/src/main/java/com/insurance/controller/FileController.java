package com.insurance.controller;

import com.insurance.entity.Attachment;
import com.insurance.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {
    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long policyId,
            @RequestParam(required = false) Long claimId,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(fileStorageService.storeFile(file, policyId, claimId, description));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        Resource resource = fileStorageService.loadFileAsResource(id);
        Attachment attachment = fileStorageService.getAttachmentById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(attachment.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + attachment.getOriginalFileName() + "\"")
                .body(resource);
    }

    @GetMapping("/policy/{policyId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByPolicyId(@PathVariable Long policyId) {
        return ResponseEntity.ok(fileStorageService.getAttachmentsByPolicyId(policyId));
    }

    @GetMapping("/claim/{claimId}")
    public ResponseEntity<List<Attachment>> getAttachmentsByClaimId(@PathVariable Long claimId) {
        return ResponseEntity.ok(fileStorageService.getAttachmentsByClaimId(claimId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Attachment> getAttachmentById(@PathVariable Long id) {
        return fileStorageService.getAttachmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAttachment(@PathVariable Long id) {
        fileStorageService.deleteAttachment(id);
        return ResponseEntity.ok().build();
    }
}
