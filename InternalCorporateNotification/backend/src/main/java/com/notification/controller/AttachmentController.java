package com.notification.controller;

import com.notification.common.Result;
import com.notification.entity.Attachment;
import com.notification.service.AttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/attachments")
public class AttachmentController {

    @Autowired
    private AttachmentService attachmentService;

    @PostMapping("/upload")
    public Result<Attachment> upload(@RequestParam("file") MultipartFile file,
                                     @RequestParam("announcementId") Long announcementId) throws IOException {
        return attachmentService.upload(file, announcementId);
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> download(@PathVariable Long id) throws IOException {
        Result<Attachment> result = attachmentService.download(id);
        if (result.getCode() != 200) {
            return ResponseEntity.notFound().build();
        }

        Attachment attachment = result.getData();
        File file = attachmentService.getAttachmentFile(attachment.getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        String filename = URLEncoder.encode(attachment.getFileName(), StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + filename)
                .body(resource);
    }

    @GetMapping("/announcement/{announcementId}")
    public Result<?> getByAnnouncementId(@PathVariable Long announcementId) {
        return Result.success(attachmentService.lambdaQuery()
                .eq(Attachment::getAnnouncementId, announcementId)
                .list());
    }

    @DeleteMapping("/{id}")
    public Result<?> delete(@PathVariable Long id) {
        attachmentService.removeById(id);
        return Result.success("删除成功");
    }
}
