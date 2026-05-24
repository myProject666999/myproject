package com.example.complaint.controller;

import com.example.complaint.entity.ComplaintFile;
import com.example.complaint.repository.ComplaintFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final ComplaintFileRepository fileRepository;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @GetMapping("/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        ComplaintFile file = fileRepository.findById(id).orElse(null);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        try {
            Path path = Paths.get(file.getFilePath());
            Resource resource = new UrlResource(path.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }
            String mediaType = file.getFileType() != null ? file.getFileType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;
            String encodedName = URLEncoder.encode(file.getFileName(), StandardCharsets.UTF_8).replace("+", "%20");
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mediaType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename*=UTF-8''" + encodedName)
                    .body(resource);
        } catch (MalformedURLException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
