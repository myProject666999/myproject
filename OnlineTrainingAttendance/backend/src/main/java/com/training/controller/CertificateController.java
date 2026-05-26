package com.training.controller;

import com.training.common.Result;
import com.training.entity.Certificate;
import com.training.service.CertificateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/certificate")
public class CertificateController {

    @Autowired
    private CertificateService certificateService;

    @GetMapping("/{id}")
    public Result<Certificate> getById(@PathVariable Long id) {
        return certificateService.getById(id);
    }

    @GetMapping("/no/{certificateNo}")
    public Result<Certificate> getByCertificateNo(@PathVariable String certificateNo) {
        return certificateService.getByCertificateNo(certificateNo);
    }

    @GetMapping("/verify")
    public Result<Certificate> verify(@RequestParam String verifyCode) {
        return certificateService.verify(verifyCode);
    }

    @GetMapping("/training/{trainingId}")
    public Result<List<Certificate>> listByTraining(@PathVariable Long trainingId) {
        return certificateService.listByTraining(trainingId);
    }

    @GetMapping("/student/{studentId}")
    public Result<List<Certificate>> listByStudent(@PathVariable Long studentId) {
        return certificateService.listByStudent(studentId);
    }

    @GetMapping
    public Result<List<Certificate>> list() {
        return certificateService.list();
    }

    @PostMapping
    public Result<Certificate> issue(@RequestBody Certificate certificate) {
        return certificateService.issue(certificate);
    }

    @PutMapping
    public Result<Certificate> update(@RequestBody Certificate certificate) {
        return certificateService.update(certificate);
    }

    @PostMapping("/{id}/revoke")
    public Result<String> revoke(@PathVariable Long id,
                                 @RequestParam(required = false) String reason) {
        return certificateService.revoke(id, reason);
    }

    @GetMapping("/{id}/image")
    public Result<String> getCertificateImage(@PathVariable Long id) {
        return certificateService.getCertificateImageBase64(id);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        return certificateService.delete(id);
    }
}
