package com.dental.clinic.service;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.IdUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class FileService {

    @Value("${file.upload.path}")
    private String uploadPath;

    public String upload(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("上传文件为空");
        }

        String datePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String fullPath = uploadPath + datePath + "/";
        FileUtil.mkdir(fullPath);

        String originalFilename = file.getOriginalFilename();
        String suffix = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String filename = IdUtil.simpleUUID() + suffix;
        
        File dest = new File(fullPath + filename);
        file.transferTo(dest);
        
        return "/uploads/" + datePath + "/" + filename;
    }
}
