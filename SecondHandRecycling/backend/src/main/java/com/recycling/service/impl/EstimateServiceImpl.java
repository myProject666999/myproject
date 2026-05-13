package com.recycling.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.alibaba.fastjson2.JSON;
import com.recycling.dto.EstimateRequestDTO;
import com.recycling.entity.Category;
import com.recycling.entity.EstimateModel;
import com.recycling.exception.BusinessException;
import com.recycling.mapper.EstimateModelMapper;
import com.recycling.service.CategoryService;
import com.recycling.service.EstimateService;
import com.recycling.vo.EstimateResultVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class EstimateServiceImpl extends ServiceImpl<EstimateModelMapper, EstimateModel> implements EstimateService {

    @Autowired
    private CategoryService categoryService;

    @Override
    public List<EstimateModel> getByCategoryId(Long categoryId) {
        return list(new LambdaQueryWrapper<EstimateModel>()
                .eq(EstimateModel::getCategoryId, categoryId)
                .eq(EstimateModel::getDeleted, 0)
                .orderByAsc(EstimateModel::getSort));
    }

    @Override
    public EstimateResultVO calculateEstimate(EstimateRequestDTO request) {
        Category category = categoryService.getById(request.getCategoryId());
        if (category == null || category.getStatus() != 1) {
            throw new BusinessException("品类不存在或已下架");
        }

        List<EstimateModel> factors = getByCategoryId(request.getCategoryId());
        
        Map<Long, EstimateModel> factorMap = factors.stream()
                .collect(Collectors.toMap(EstimateModel::getId, f -> f));

        BigDecimal basePrice = category.getBasePrice() != null ? category.getBasePrice() : BigDecimal.ZERO;
        BigDecimal totalMultiplier = BigDecimal.ONE;
        BigDecimal quantity = request.getQuantity() != null ? request.getQuantity() : BigDecimal.ONE;

        if (request.getFactorAnswers() != null) {
            for (EstimateRequestDTO.FactorAnswer answer : request.getFactorAnswers()) {
                EstimateModel factor = factorMap.get(answer.getFactorId());
                if (factor != null) {
                    BigDecimal multiplier = calculateFactorMultiplier(factor, answer);
                    totalMultiplier = totalMultiplier.multiply(multiplier);
                }
            }
        }

        BigDecimal estimatedPrice = basePrice
                .multiply(quantity)
                .multiply(totalMultiplier)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal minMultiplier = new BigDecimal("0.4");
        BigDecimal maxMultiplier = new BigDecimal("1.4");

        EstimateResultVO vo = new EstimateResultVO();
        vo.setCategoryId(category.getId());
        vo.setCategoryName(category.getName());
        vo.setBasePrice(basePrice);
        vo.setUnit(category.getUnit());
        vo.setQuantity(quantity);
        vo.setEstimatedPrice(estimatedPrice);
        vo.setMinPrice(basePrice.multiply(quantity).multiply(minMultiplier).setScale(2, RoundingMode.HALF_UP));
        vo.setMaxPrice(basePrice.multiply(quantity).multiply(maxMultiplier).setScale(2, RoundingMode.HALF_UP));
        vo.setDescription("预估价格仅供参考，最终价格以回收员现场评估为准");

        return vo;
    }

    private BigDecimal calculateFactorMultiplier(EstimateModel factor, EstimateRequestDTO.FactorAnswer answer) {
        BigDecimal multiplier = BigDecimal.ONE;
        
        switch (factor.getFactorType()) {
            case "SELECT":
                if (answer.getSelectedOption() != null) {
                    String option = answer.getSelectedOption();
                    if (option.contains("+")) {
                        try {
                            String percentStr = option.substring(option.indexOf("+") + 1, option.indexOf("%"));
                            multiplier = BigDecimal.ONE.add(new BigDecimal(percentStr).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                        } catch (Exception e) {
                        }
                    } else if (option.contains("-")) {
                        try {
                            String percentStr = option.substring(option.indexOf("-") + 1, option.indexOf("%"));
                            multiplier = BigDecimal.ONE.subtract(new BigDecimal(percentStr).divide(new BigDecimal("100"), 4, RoundingMode.HALF_UP));
                        } catch (Exception e) {
                        }
                    }
                }
                break;
            case "NUMBER":
                break;
            default:
                break;
        }
        
        return multiplier;
    }
}
