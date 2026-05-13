package com.recycling.controller;

import com.recycling.common.Result;
import com.recycling.dto.EstimateRequestDTO;
import com.recycling.entity.EstimateModel;
import com.recycling.service.EstimateService;
import com.recycling.vo.EstimateResultVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/estimate")
public class EstimateController {

    @Autowired
    private EstimateService estimateService;

    @GetMapping("/factors/{categoryId}")
    public Result<List<EstimateModel>> getFactors(@PathVariable Long categoryId) {
        return Result.success(estimateService.getByCategoryId(categoryId));
    }

    @PostMapping("/calculate")
    public Result<EstimateResultVO> calculate(@Valid @RequestBody EstimateRequestDTO request) {
        return Result.success(estimateService.calculateEstimate(request));
    }
}
