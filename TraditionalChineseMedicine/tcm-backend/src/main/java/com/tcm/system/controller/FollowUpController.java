package com.tcm.system.controller;

import com.tcm.system.config.Result;
import com.tcm.system.entity.FollowUp;
import com.tcm.system.service.FollowUpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/followup")
public class FollowUpController {

    @Autowired
    private FollowUpService followUpService;

    @GetMapping("/patient/{patientId}")
    public Result<List<FollowUp>> listByPatient(@PathVariable Long patientId) {
        return Result.success(followUpService.listByPatient(patientId));
    }

    @GetMapping("/{id}")
    public Result<FollowUp> getById(@PathVariable Long id) {
        return Result.success(followUpService.getById(id));
    }

    @PostMapping
    public Result<Boolean> save(@RequestBody FollowUp followUp) {
        return Result.success(followUpService.save(followUp));
    }

    @PutMapping
    public Result<Boolean> update(@RequestBody FollowUp followUp) {
        return Result.success(followUpService.update(followUp));
    }

    @DeleteMapping("/{id}")
    public Result<Boolean> delete(@PathVariable Long id) {
        return Result.success(followUpService.delete(id));
    }
}
