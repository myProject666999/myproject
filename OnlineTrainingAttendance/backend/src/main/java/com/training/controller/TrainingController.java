package com.training.controller;

import com.training.common.Result;
import com.training.entity.Training;
import com.training.service.TrainingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/training")
public class TrainingController {

    @Autowired
    private TrainingService trainingService;

    @GetMapping("/{id}")
    public Result<Training> getById(@PathVariable Long id) {
        return trainingService.getById(id);
    }

    @GetMapping
    public Result<List<Training>> list(@RequestParam(required = false) String name,
                                       @RequestParam(required = false) Integer status) {
        return trainingService.list(name, status);
    }

    @GetMapping("/ongoing")
    public Result<List<Training>> listOngoing() {
        return trainingService.listOngoing();
    }

    @GetMapping("/ended")
    public Result<List<Training>> listEnded() {
        return trainingService.listEnded();
    }

    @GetMapping("/upcoming")
    public Result<List<Training>> listUpcoming() {
        return trainingService.listUpcoming();
    }

    @PostMapping
    public Result<Training> save(@RequestBody Training training) {
        return trainingService.add(training);
    }

    @PutMapping
    public Result<Training> update(@RequestBody Training training) {
        return trainingService.update(training);
    }

    @DeleteMapping("/{id}")
    public Result<String> delete(@PathVariable Long id) {
        return trainingService.delete(id);
    }

    @PostMapping("/{id}/qrcode")
    public Result<String> generateQrCode(@PathVariable Long id,
                                         @RequestParam(required = false) String baseUrl) {
        return trainingService.generateQrCode(id, baseUrl);
    }
}
