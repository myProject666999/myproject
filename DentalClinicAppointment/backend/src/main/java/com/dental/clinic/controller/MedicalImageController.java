package com.dental.clinic.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.dental.clinic.common.PageResult;
import com.dental.clinic.common.Result;
import com.dental.clinic.entity.MedicalImage;
import com.dental.clinic.service.FileService;
import com.dental.clinic.service.MedicalImageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/medical-images")
@CrossOrigin
public class MedicalImageController {

    @Autowired
    private MedicalImageService medicalImageService;

    @Autowired
    private FileService fileService;

    @GetMapping
    public Result<PageResult<MedicalImage>> list(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) String imageType) {
        Page<MedicalImage> page = medicalImageService.page(current, size, patientId, imageType);
        return Result.success(PageResult.of(page.getTotal(), page.getRecords(), page.getCurrent(), page.getSize()));
    }

    @GetMapping("/patient/{patientId}")
    public Result<List<MedicalImage>> listByPatientId(@PathVariable Long patientId) {
        List<MedicalImage> images = medicalImageService.listByPatientId(patientId);
        return Result.success(images);
    }

    @GetMapping("/treatment-record/{treatmentRecordId}")
    public Result<List<MedicalImage>> listByTreatmentRecordId(@PathVariable Long treatmentRecordId) {
        List<MedicalImage> images = medicalImageService.listByTreatmentRecordId(treatmentRecordId);
        return Result.success(images);
    }

    @GetMapping("/{id}")
    public Result<MedicalImage> getById(@PathVariable Long id) {
        MedicalImage image = medicalImageService.getById(id);
        if (image == null) {
            return Result.error("影像不存在");
        }
        return Result.success(image);
    }

    @PostMapping("/upload")
    public Result<String> upload(@RequestParam("file") MultipartFile file) {
        try {
            String path = fileService.upload(file);
            return Result.success(path);
        } catch (IOException e) {
            return Result.error("上传失败: " + e.getMessage());
        }
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody MedicalImage image) {
        if (image.getTakeDate() == null) {
            image.setTakeDate(LocalDateTime.now());
        }
        boolean result = medicalImageService.save(image);
        return result ? Result.success(true) : Result.error("保存失败");
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        boolean result = medicalImageService.delete(id);
        return result ? Result.success(true) : Result.error("删除失败");
    }
}
