package com.onsiterepair.controller;

import com.onsiterepair.common.Result;
import com.onsiterepair.dto.LoginDTO;
import com.onsiterepair.dto.RegisterDTO;
import com.onsiterepair.entity.Worker;
import com.onsiterepair.service.WorkerService;
import com.onsiterepair.vo.LoginVO;
import javax.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/worker")
@RequiredArgsConstructor
public class WorkerController {

    private final WorkerService workerService;

    @PostMapping("/login")
    public Result<LoginVO> login(@Valid @RequestBody LoginDTO dto) {
        return Result.success(workerService.login(dto));
    }

    @PostMapping("/register")
    public Result<LoginVO> register(@Valid @RequestBody RegisterDTO dto) {
        return Result.success(workerService.register(dto));
    }

    @GetMapping("/nearby")
    public Result<List<Worker>> getNearbyWorkers(
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "10") Double radius) {
        return Result.success(workerService.findNearbyWorkers(latitude, longitude, category, radius));
    }

    @PutMapping("/location")
    public Result<Worker> updateLocation(
            @RequestAttribute("userId") Long workerId,
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude,
            @RequestParam(required = false) String address) {
        return Result.success(workerService.updateLocation(workerId, latitude, longitude, address));
    }
}
