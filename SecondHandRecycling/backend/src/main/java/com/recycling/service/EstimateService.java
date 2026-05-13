package com.recycling.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.recycling.dto.EstimateRequestDTO;
import com.recycling.entity.EstimateModel;
import com.recycling.vo.EstimateResultVO;

import java.util.List;

public interface EstimateService extends IService<EstimateModel> {
    List<EstimateModel> getByCategoryId(Long categoryId);
    EstimateResultVO calculateEstimate(EstimateRequestDTO request);
}
