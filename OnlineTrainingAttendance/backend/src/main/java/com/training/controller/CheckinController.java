package com.training.controller;

import com.training.common.Result;
import com.training.entity.CheckinSession;
import com.training.service.CheckinSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/checkin")
public class CheckinController {

    @Autowired
    private CheckinSessionService checkinSessionService;

    @GetMapping("/{id}")
    public Result<CheckinSession> getById(@PathVariable Long id) {
        return checkinSessionService.getById(id);
    }

    @GetMapping("/token/{token}")
    public Result<CheckinSession> getByToken(@PathVariable String token) {
        return checkinSessionService.getByToken(token);
    }

    @GetMapping("/training/{trainingId}")
    public Result<List<CheckinSession>> listByTraining(@PathVariable Long trainingId) {
        return checkinSessionService.listByTraining(trainingId);
    }

    @GetMapping("/training/{trainingId}/active")
    public Result<List<CheckinSession>> listActiveByTraining(@PathVariable Long trainingId) {
        return checkinSessionService.listActiveByTraining(trainingId);
    }

    @GetMapping
    public Result<List<CheckinSession>> listAll() {
        return checkinSessionService.listAll();
    }

    @PostMapping
    public Result<CheckinSession> create(@RequestParam Long trainingId,
                                         @RequestParam(required = false) Long createdBy,
                                         @RequestParam(required = false) Integer durationMinutes,
                                         @RequestParam(required = false) String baseUrl) {
        return checkinSessionService.create(trainingId, createdBy, durationMinutes, baseUrl);
    }

    @PostMapping("/{id}/deactivate")
    public Result<String> deactivate(@PathVariable Long id) {
        return checkinSessionService.deactivate(id);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        return checkinSessionService.delete(id);
    }
}
