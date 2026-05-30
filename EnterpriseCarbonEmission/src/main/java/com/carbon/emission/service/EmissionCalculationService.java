package com.carbon.emission.service;

import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.carbon.emission.entity.EmissionCalculation;
import com.carbon.emission.entity.EmissionData;
import com.carbon.emission.entity.EmissionFactor;
import com.carbon.emission.entity.Organization;
import com.carbon.emission.mapper.EmissionCalculationMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class EmissionCalculationService extends ServiceImpl<EmissionCalculationMapper, EmissionCalculation> {

    @Autowired
    private EmissionDataService emissionDataService;

    @Autowired
    private EmissionFactorService emissionFactorService;

    @Autowired
    private OrganizationService organizationService;

    @Transactional(rollbackFor = Exception.class)
    public Map<String, Object> calculateEmission(Long orgId, Integer periodType, String periodValue) {
        Map<String, Object> result = new HashMap<>();
        
        baseMapper.physicalDeleteByPeriod(orgId, periodType, periodValue);

        List<Organization> childOrgs = organizationService.getChildOrganizations(orgId);
        List<Long> orgIds = childOrgs.stream().map(Organization::getId).collect(Collectors.toList());
        orgIds.add(orgId);

        List<EmissionData> dataList = emissionDataService.list(new LambdaQueryWrapper<EmissionData>()
                .in(EmissionData::getOrgId, orgIds)
                .likeRight(EmissionData::getActivityMonth, formatPeriod(periodType, periodValue))
                .eq(EmissionData::getStatus, 1));

        Map<Integer, List<EmissionData>> scopeDataMap = dataList.stream()
                .collect(Collectors.groupingBy(EmissionData::getEmissionScope));

        Map<Integer, BigDecimal> scopeEmissions = new HashMap<>();
        BigDecimal totalEmission = BigDecimal.ZERO;
        String currentFactorVersion = getCurrentFactorVersion();

        for (int scope = 1; scope <= 3; scope++) {
            List<EmissionData> scopeData = scopeDataMap.getOrDefault(scope, Collections.emptyList());
            BigDecimal scopeEmission = calculateScopeEmission(scopeData, scope, orgId, periodType, periodValue, currentFactorVersion);
            scopeEmissions.put(scope, scopeEmission);
            totalEmission = totalEmission.add(scopeEmission);
        }

        saveTotalCalculation(orgId, periodType, periodValue, totalEmission, scopeEmissions, currentFactorVersion);

        result.put("totalEmission", totalEmission);
        result.put("scope1Emission", scopeEmissions.getOrDefault(1, BigDecimal.ZERO));
        result.put("scope2Emission", scopeEmissions.getOrDefault(2, BigDecimal.ZERO));
        result.put("scope3Emission", scopeEmissions.getOrDefault(3, BigDecimal.ZERO));
        result.put("factorVersion", currentFactorVersion);
        result.put("dataCount", dataList.size());

        return result;
    }

    private BigDecimal calculateScopeEmission(List<EmissionData> dataList, Integer scope, Long orgId, 
                                              Integer periodType, String periodValue, String factorVersion) {
        BigDecimal totalEmission = BigDecimal.ZERO;

        Map<Integer, List<EmissionData>> sourceTypeMap = dataList.stream()
                .collect(Collectors.groupingBy(EmissionData::getSourceType));

        for (Map.Entry<Integer, List<EmissionData>> entry : sourceTypeMap.entrySet()) {
            Integer sourceType = entry.getKey();
            List<EmissionData> sourceDataList = entry.getValue();

            BigDecimal sourceTotalActivity = BigDecimal.ZERO;
            BigDecimal sourceTotalEmission = BigDecimal.ZERO;
            StringBuilder formulaBuilder = new StringBuilder();

            for (EmissionData data : sourceDataList) {
                BigDecimal emission = calculateSingleEmission(data);
                sourceTotalActivity = sourceTotalActivity.add(data.getQuantity());
                sourceTotalEmission = sourceTotalEmission.add(emission);
                
                if (formulaBuilder.length() > 0) {
                    formulaBuilder.append(" + ");
                }
                formulaBuilder.append(data.getActivityName())
                        .append("(").append(data.getQuantity()).append(data.getUnit()).append(")");
            }

            totalEmission = totalEmission.add(sourceTotalEmission);

            saveCalculationDetail(orgId, periodType, periodValue, scope, sourceType, 
                    sourceTotalActivity, sourceTotalEmission, factorVersion, 
                    "排放量 = " + formulaBuilder.toString() + " × 对应排放因子");
        }

        return totalEmission;
    }

    private BigDecimal calculateSingleEmission(EmissionData data) {
        if (data.getFactorId() != null) {
            EmissionFactor factor = emissionFactorService.getById(data.getFactorId());
            if (factor != null) {
                return data.getQuantity().multiply(factor.getTotalFactor())
                        .setScale(6, RoundingMode.HALF_UP);
            }
        }
        return BigDecimal.ZERO;
    }

    private void saveCalculationDetail(Long orgId, Integer periodType, String periodValue, 
                                       Integer emissionScope, Integer sourceType, 
                                       BigDecimal activityTotal, BigDecimal emissionTotal,
                                       String factorVersion, String formula) {
        EmissionCalculation calculation = new EmissionCalculation();
        calculation.setCalculationNo("CAL" + System.currentTimeMillis() + sourceType);
        calculation.setOrgId(orgId);
        calculation.setPeriodType(periodType);
        calculation.setPeriodValue(periodValue);
        calculation.setEmissionScope(emissionScope);
        calculation.setSourceType(sourceType);
        calculation.setActivityTotal(activityTotal);
        calculation.setEmissionTotal(emissionTotal);
        calculation.setFactorVersion(factorVersion);
        calculation.setCalculationFormula(formula);
        calculation.setIsSummary(0);
        calculation.setCalculationStatus(1);
        calculation.setCreateTime(LocalDateTime.now());
        calculation.setUpdateTime(LocalDateTime.now());
        save(calculation);
    }

    private void saveTotalCalculation(Long orgId, Integer periodType, String periodValue, 
                                      BigDecimal totalEmission, Map<Integer, BigDecimal> scopeEmissions,
                                      String factorVersion) {
        EmissionCalculation calculation = new EmissionCalculation();
        calculation.setCalculationNo("CAL" + System.currentTimeMillis() + "TOTAL");
        calculation.setOrgId(orgId);
        calculation.setPeriodType(periodType);
        calculation.setPeriodValue(periodValue);
        calculation.setEmissionScope(4);
        calculation.setEmissionTotal(totalEmission);
        calculation.setFactorVersion(factorVersion);
        calculation.setCalculationFormula("总排放量 = 范围一(" + scopeEmissions.getOrDefault(1, BigDecimal.ZERO) + 
                ") + 范围二(" + scopeEmissions.getOrDefault(2, BigDecimal.ZERO) + 
                ") + 范围三(" + scopeEmissions.getOrDefault(3, BigDecimal.ZERO) + ")");
        calculation.setIsSummary(1);
        calculation.setCalculationStatus(1);
        calculation.setCreateTime(LocalDateTime.now());
        calculation.setUpdateTime(LocalDateTime.now());
        save(calculation);
    }

    private String formatPeriod(Integer periodType, String periodValue) {
        if (periodType == 1) {
            return periodValue;
        } else if (periodType == 2) {
            String year = periodValue.substring(0, 4);
            String quarterStr = periodValue.length() > 5 ? periodValue.substring(5) : "1";
            int quarter = Integer.parseInt(quarterStr.replaceAll("[^0-9]", ""));
            int startMonth = (quarter - 1) * 3 + 1;
            int endMonth = startMonth + 2;
            return year + "-" + String.format("%02d", startMonth);
        } else {
            return periodValue;
        }
    }

    private String getCurrentFactorVersion() {
        List<EmissionFactor> factors = emissionFactorService.getCurrentVersionFactors();
        return factors.isEmpty() ? "V1.0" : factors.get(0).getVersion();
    }

    public List<EmissionCalculation> getCalculationResults(Long orgId, Integer periodType, String periodValue) {
        return list(new LambdaQueryWrapper<EmissionCalculation>()
                .eq(EmissionCalculation::getOrgId, orgId)
                .eq(EmissionCalculation::getPeriodType, periodType)
                .eq(EmissionCalculation::getPeriodValue, periodValue)
                .eq(EmissionCalculation::getCalculationStatus, 1)
                .orderByAsc(EmissionCalculation::getEmissionScope)
                .orderByAsc(EmissionCalculation::getSourceType));
    }
}
