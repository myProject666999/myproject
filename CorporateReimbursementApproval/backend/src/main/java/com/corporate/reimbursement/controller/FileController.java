package com.corporate.reimbursement.controller;

import com.corporate.reimbursement.common.Result;
import com.corporate.reimbursement.entity.InvoiceAttachment;
import com.corporate.reimbursement.mapper.InvoiceAttachmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/file")
public class FileController {

    private static final String UPLOAD_DIR = "./uploads/invoices/";

    @Autowired
    private InvoiceAttachmentMapper invoiceAttachmentMapper;

    @PostMapping("/upload")
    public Result<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return Result.error("文件不能为空");
        }

        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String newFilename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR, newFilename);
            Files.copy(file.getInputStream(), filePath);

            InvoiceAttachment attachment = new InvoiceAttachment();
            attachment.setFileName(originalFilename);
            attachment.setFilePath(filePath.toString());
            attachment.setFileType(file.getContentType());
            attachment.setFileSize(file.getSize());
            attachment.setCreateTime(LocalDateTime.now());
            invoiceAttachmentMapper.insert(attachment);

            Map<String, Object> data = new HashMap<>();
            data.put("id", attachment.getId());
            data.put("fileName", originalFilename);
            data.put("filePath", filePath.toString());
            data.put("fileType", file.getContentType());
            data.put("fileSize", file.getSize());
            return Result.success("上传成功", data);
        } catch (IOException e) {
            return Result.error("文件上传失败: " + e.getMessage());
        }
    }

    @GetMapping("/download/{id}")
    public void download(@PathVariable Long id, jakarta.servlet.http.HttpServletResponse response) {
        InvoiceAttachment attachment = invoiceAttachmentMapper.selectById(id);
        if (attachment == null) {
            try {
                response.sendError(jakarta.servlet.http.HttpServletResponse.SC_NOT_FOUND, "文件不存在");
            } catch (IOException ignored) {
            }
            return;
        }

        Path filePath = Paths.get(attachment.getFilePath());
        File file = filePath.toFile();
        if (!file.exists()) {
            try {
                response.sendError(jakarta.servlet.http.HttpServletResponse.SC_NOT_FOUND, "文件不存在");
            } catch (IOException ignored) {
            }
            return;
        }

        try {
            response.setContentType(attachment.getFileType());
            response.setHeader("Content-Disposition", "attachment; filename=\"" + attachment.getFileName() + "\"");
            Files.copy(filePath, response.getOutputStream());
        } catch (IOException e) {
            try {
                response.sendError(jakarta.servlet.http.HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "下载失败");
            } catch (IOException ignored) {
            }
        }
    }
}