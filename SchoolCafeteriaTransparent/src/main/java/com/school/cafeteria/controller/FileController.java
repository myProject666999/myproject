package com.school.cafeteria.controller;

import com.school.cafeteria.common.Result;
import com.school.cafeteria.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private FileService fileService;

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        try {
            String url = fileService.uploadFile(file);
            return Result.success("上传成功", url);
        } catch (IOException e) {
            return Result.error("上传失败：" + e.getMessage());
        }
    }

    @PostMapping("/upload/batch")
    public Result<List<String>> uploadBatch(@RequestParam("files") MultipartFile[] files) {
        List<String> urls = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                String url = fileService.uploadFile(file);
                urls.add(url);
            }
            return Result.success("批量上传成功", urls);
        } catch (IOException e) {
            return Result.error("上传失败：" + e.getMessage());
        }
    }

    @DeleteMapping("/delete")
    public Result<Void> delete(@RequestParam String fileUrl) {
        boolean deleted = fileService.deleteFile(fileUrl);
        if (deleted) {
            return Result.success();
        } else {
            return Result.error("删除失败");
        }
    }
}
