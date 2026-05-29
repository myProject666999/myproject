package com.notification.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.notification.common.Result;
import com.notification.entity.Attachment;
import com.notification.mapper.AttachmentMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AttachmentService extends ServiceImpl<AttachmentMapper, Attachment> {

    @Value("${file.upload-path}")
    private String uploadPath;

    @PostConstruct
    public void init() {
        try {
            Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }
        } catch (IOException e) {
            throw new RuntimeException("创建上传目录失败: " + uploadPath, e);
        }
    }

    public Result<Attachment> upload(MultipartFile file, Long announcementId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : "";
        String newFilename = UUID.randomUUID().toString().replace("-", "") + extension;

        Path uploadDir = Paths.get(uploadPath).toAbsolutePath().normalize();
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        Path filePath = uploadDir.resolve(newFilename);
        file.transferTo(filePath.toFile());

        Attachment attachment = new Attachment();
        attachment.setAnnouncementId(announcementId);
        attachment.setFileName(originalFilename);
        attachment.setFilePath(newFilename);
        attachment.setFileSize(file.getSize());
        attachment.setFileType(file.getContentType());
        attachment.setDownloadCount(0);

        this.save(attachment);
        return Result.success("上传成功", attachment);
    }

    public Result<Attachment> download(Long id) {
        Attachment attachment = this.getById(id);
        if (attachment == null) {
            return Result.error("附件不存在");
        }
        attachment.setDownloadCount(attachment.getDownloadCount() + 1);
        this.updateById(attachment);
        return Result.success(attachment);
    }

    public File getAttachmentFile(String filePath) {
        return Paths.get(uploadPath).toAbsolutePath().normalize().resolve(filePath).toFile();
    }
}
