package com.school.cafeteria.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.UUID;

@Service
public class FileService {

    private static final String UPLOAD_DIR = "uploads";

    public String uploadFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("文件不能为空");
        }

        String dateStr = new SimpleDateFormat("yyyy/MM/dd").format(new Date());
        Path uploadPath = Paths.get(UPLOAD_DIR, dateStr);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";
        String newFilename = UUID.randomUUID().toString() + extension;

        Path filePath = uploadPath.resolve(newFilename);
        file.transferTo(filePath.toFile());

        return "/uploads/" + dateStr + "/" + newFilename;
    }

    public boolean deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return false;
        }
        try {
            String filePath = fileUrl.replaceFirst("/uploads/", UPLOAD_DIR + "/");
            File file = new File(filePath);
            return file.delete();
        } catch (Exception e) {
            return false;
        }
    }
}
