package com.recipebook.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename != null && originalFilename.contains(".")
                ? originalFilename.substring(originalFilename.lastIndexOf("."))
                : ".jpg";

        String dateStr = new SimpleDateFormat("yyyyMMdd").format(new Date());
        String newFilename = dateStr + "_" + UUID.randomUUID().toString().substring(0, 8) + extension;

        Path filePath = Paths.get(UPLOAD_DIR, newFilename);
        Files.copy(file.getInputStream(), filePath);

        String fileUrl = "/uploads/" + newFilename;
        Map<String, String> response = new HashMap<>();
        response.put("url", fileUrl);
        response.put("filename", newFilename);

        return ResponseEntity.ok(response);
    }
}
